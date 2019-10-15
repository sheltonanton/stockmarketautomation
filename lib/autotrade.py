import numpy as np
import pandas as pd
import requests
import json
import time
from threading import Thread


class History:
    """
        History class is used to obtain historical data of candles for a time range and period
        Also used to get the instrument token if necessary
    """
    def __init__(self, csv=None, url=None, instruments=None):
        #load the instruments
        self.instruments = instruments
        self.csv = csv
        self.url = url
        
    def get_instrument_token(self, symbol, exchange, instrument_type):
        self.instruments = self.instruments[self.instruments['instrument_type']==instrument_type]
        self.instruments = self.instruments[self.instruments['exchange']==exchange]
        instrument_token = np.array(self.instruments[self.instruments['tradingsymbol']==symbol].loc[:,'instrument_token'])[0]
        return instrument_token
    
    def get_data(self, instrument_token, time_type, from_time, to_time):
        #todo add a cache layer to handle already asked requests or read from a file if downloaded
        url = self.url.format(instrument_token, time_type, from_time, to_time)
        response = requests.get(url)
        response = response.content.decode('utf-8')
        data = json.loads(response)
        data = data['data']['candles']
        return pd.DataFrame(data, columns=['t','o','h','l','c','v'])
        
    def get_instrument(self, time_type, from_time, to_time, exchange, instrument_type, symbol=None, instrument_token=None):
        if(instrument_token):
            data = self.get_data(instrument_token, time_type, from_time, to_time)
            data['t'] = np.int64((pd.to_datetime(data['t']).astype(np.int64)) /1000000000)
            return data
        if(symbol):
            instrument_token = self.get_instrument_token(symbol, exchange, instrument_type)
            data = self.get_data(instrument_token, time_type, from_time, to_time)
            data['t'] = np.int64((pd.to_datetime(data['t']).astype(np.int64)) /1000000000)
            return data

class BacktestRunloop:
    """
        Three steps in strategy testing
        1. Find Entry - Could be given manually at time, at price and through indication
        2. Set Target - defined price, range, percent change, intraday and hold for as long as upto current time
        3. Set Stoploss - defined price, range, percent change and no stop loss
        4. Set Exit - Timeout to specify when to exit
    """
    def __init__(self, name="", logic=None, entry=None, target=None, stoploss=None, exit_time=None):
        self.name = name
        self.logic = logic
        self.INTRADAY = "intraday"
        self.POSITIONAL = "positional"
        self.entry = entry
        self.target = target
        self.stoploss = stoploss
        self.exit = exit_time
        
    def run(self, df):
        #call entry logic and get the entry
        self.entry = (self.logic(t="entry", k={}), self.entry)[self.entry is not None]
        self.target = (self.logic(t="target", k={'entry':self.entry}), self.target)[self.target is not None]
        self.stoploss = (self.logic(t="stoploss", k={'entry':self.entry}), self.stoploss)[self.stoploss is not None]
        self.exit = (self.logic(t="exit", k={'entry':self.entry}), self.exit)[self.exit is not None]
        
        result = pd.Series(False, self.entry.index)
        output = pd.DataFrame(columns=['entry','target','stoploss','start','end','traded_amount'])
            
        for index,row in self.entry.iterrows():
            start_time = df.loc[index, 't']
            end_time = df.loc[index, 't']
            target = self.target.loc[index]
            stop_loss = self.stoploss.loc[index]
            exit_ = self.exit.loc[index]
            i = index
            output.loc[index, 'entry'] = row['price']
            output.loc[index, 'target'] = target
            output.loc[index, 'stoploss'] = stop_loss
            output.loc[index, 'start'] = start_time
            output.loc[index, 'dir'] = ('up','down')[row['down']]
            while True:
                i = i+1
                r = df.loc[i]
                if(row['t'] >= exit_):
                    end_time = r['t']
                    output.loc[index, 'end'] = end_time
                    output.loc[index, 'traded_amount'] = (r['price'] - row['price'], row['price'] - r['price'])[row['up']]
                    result.loc[index] = (output.loc[index, 'traded_amount'] > 0)
                    break
                if(row['up'] and r['h'] >= target):
                    result.loc[index] = True
                    end_time = r['t']
                    output.loc[index, 'end'] = end_time
                    output.loc[index, 'traded_amount'] = target - row['price']
                    break
                elif(row['down'] and r['l'] <= target):
                    result.loc[index] = True
                    end_time = r['t']
                    output.loc[index, 'end'] = end_time
                    output.loc[index, 'traded_amount'] = row['price'] - target
                    break

                if(row['up'] and r['l'] <= stop_loss):
                    result.loc[index] = False
                    end_time = r['t']
                    output.loc[index, 'end'] = end_time
                    output.loc[index, 'traded_amount'] = stop_loss - row['price']
                    break
                elif(row['down'] and r['h'] >= stop_loss):
                    result.loc[index] = False
                    end_time = r['t']
                    output.loc[index, 'end'] = end_time
                    output.loc[index, 'traded_amount'] = row['price'] - stop_loss
                    break
        return(result, output)

class Strategy:
    """
        Each bit of strategy will be implemented in a chain of command
        Each strategy will do their part and send the boolean value whether the indication has occurred or not
        The Strategy builder combines the result from strategies and execute the said function
        Define:
            entry_logic    - for logic on entry into market
            target_logic   - for logic on target 
            stoploss_logic - for logic on stoploss
    """
    def __init__(self, left, cond, right, entry=None, target=None, stoploss=None, exitTime=None):
        self.OR = "or"
        self.AND = "and"
        self.left = left
        self.right = right
        self.cond = cond
        self.types = {
            'entry': (self.entry_logic, entry)[entry is not None],
            'target': (self.target_logic, target)[target is not None],
            'stoploss': (self.stoploss_logic, stoploss)[stoploss is not None],
            'exit': (self.exit_logic, exitTime)[exitTime is not None]
        }
    
    def logic(self, df=None, t='entry', k={}):
        if(self.df is not None):
            df = self.df
            
        #returns a Series of True or False whether the indication has occurred or not
        if(type(self.left) == Strategy):
            ln = self.left.logic(df=df, t=t, k=k)
            
        if(type(self.right) == Strategy):
            rn = self.right.logic(df=df, t=t, k=k)
         
        if(not(self.left and self.right)):
            if(type(self.types[t])==pd.Series or type(self.types[t]) == pd.DataFrame):
                return self.types[t]
            else:
                return self.types[t](df=df, k=k)
        
        return ( ln | rn, ln & rn )[self.cond == self.AND]
    
    def run(self, df=None):
        self.df = df
        series = None
        if (df is not None):
            #BackTestRunLoop
            backtestRunloop = BacktestRunloop(logic=self.logic)
            #should return True or Flase series 
            (result, output) = backtestRunloop.run(df)
            return (result, output)
        return series
    
    def entry_logic(self, df=None, k=None):
        #should return dataframe of entry points and some extra columns needed while entry
        return pd.DataFrame(columns=['up', 'down'])
        
    def target_logic(self, df=None, k=None):
        #should return series of target on entry points on index
        pass
    def stoploss_logic(self, df=None, k=None):
        #should return series of stoploss on entry points on index
        pass
    def exit_logic(self, df=None, k=None):
        #should specify the exit condition on entry points on index
        pass

class Candles:
    def __init__(self, period=5):
        self.candles = []
        self.period = period
        self.current_range = []
    
    def run_candling(self, timeperiod, start_price):
        time.sleep(timeperiod)
        self.save_prev_candle()
    
    def start_candling(self, timeperiod=0, start_price=0):
        self.timeperiod = timeperiod
        if(start_price): 
            self.current_range.append(start_price)
        # thread = Thread(target=self.run_candling, args=(timeperiod, start_price))
        # thread.start()
        
    def get_candles(self, start_index=0, end_index=0):
        if(end_index == 0):
            return self.candles[start_index:]
        return self.candles[start_index:end_index]

    def get_last_candles(self, count=1):
        return self.candles[-count:]
    
    def save_prev_candle(self):
        try:
            current_candle = {}
            current_candle['high'] = max(self.current_range)
            current_candle['low'] = min(self.current_range)
            current_candle['open'] = self.current_range[0]
            current_candle['close'] = self.current_range.pop()
            self.candles.append(current_candle)
            self.current_range = []
            return current_candle
        except ValueError as err:
            print(err)
            return 'error'
        
    def add_price(self, price):
        self.current_range.append(price)
    
    def get_candles_count(self):
        return len(self.candles)
    
    def nd_candles(self, start_index=0, end_index=0):
        candles = self.get_candles(start_index, end_index)
        candles = {
            'open': np.array([candle['open'] for candle in candles]),
            'close': np.array([candle['close'] for candle in candles]),
            'high': np.array([candle['high'] for candle in candles]),
            'low': np.array([candle['low'] for candle in candles]),
            'volume': np.array([])
        }
        return candles
            
    def nd_last_candles(self, count=1):
        candles = self.get_last_candles(count=count)
        candles = {
            'open': np.array([candle['open'] for candle in candles]),
            'close': np.array([candle['close'] for candle in candles]),
            'high': np.array([candle['high'] for candle in candles]),
            'low': np.array([candle['low'] for candle in candles]),
            'volume': np.array([])
        }
        return candles

class Collector:
    def __init__(self, tokens):
        self.stocks = {}
        self.tokens = tokens

    def start_collector(self):
        tokens = self.tokens
        
        for token in tokens:
            candles = Candles()
            self.stocks[token] = {
                'candles': candles
            }

    def collect_price(self, data):
        for d in data:
            token = self.stocks[int(d['token'])]
            token['candles'].add_price(float(d['lastPrice']))

    def get_partial_candles(self):
        candles = {}
        for key in self.stocks:
            stock = self.stocks[key]
            candle = stock['candles']
            candle = candle.save_prev_candle()
            if(candle != "error"):
                candles[key] = candle
        return candles

    def get_name(self):
        return "Collector"

class Trader:
    def __init__(self, name, demo=True, amount=1000, config={}):
        self.name = name
        self.demo = demo #if set to true, dummy trades are taken
        self.history = {} #records all previous trades
        self.amount = amount #amoiunt gets reduced based on the trade and may increase or decrease based on the result
        self.config = config #config contains callbacks to call when trading, some pre-requisites too

    def configure(self, config, config_fn=lambda x:x):
        '''
            Used to configure the trader with the pre-requesites
        '''
        return

    def trade(self, price, target, stop_loss, quantity):
        '''
            Trade will be taken based on the above parameters
            On non-demo trade, the callbacks will be called accordingly, if set
        '''
        return

    def get_history(self):
        return

    def close_all_trades(self):
        return

    def set_amount(self, amount):
        self.amount = amount

    def get_amount(self):
        return self.amount

    def get_result(self):
        return None
