import numpy as np
import pandas as pd
import pdb
import requests
import json
import time
from threading import Thread
from datetime import datetime, timedelta
import datetime as dt
import logging

logger = logging.getLogger('flowLogger')

class History:
    """
        History class is used to obtain historical data of candles for a time range and period
        Also used to get the instrument token if necessary
    """
    def __init__(self, csv=None, url=None, instruments=None, auth=''):
        #load the instruments
        self.instruments = instruments
        self.csv = csv
        self.url = url
        self.auth = auth
        
    def get_instrument_token(self, symbol, exchange, instrument_type):
        self.instruments = self.instruments[self.instruments['instrument_type']==instrument_type]
        self.instruments = self.instruments[self.instruments['exchange']==exchange]
        instrument_token = np.array(self.instruments[self.instruments['tradingsymbol']==symbol].loc[:,'instrument_token'])[0]
        return instrument_token
    
    def get_data(self, instrument_token, time_type, from_time, to_time):
        data = self.get_raw_data(instrument_token, time_type, from_time, to_time)
        return pd.DataFrame(data, columns=['t','o','h','l','c','v'])

    def get_raw_data(self, instrument_token, time_type, from_time, to_time):
        #todo add a cache layer to handle already asked requests or read from a file if downloaded
        from_time = type(from_time) == datetime and from_time or datetime.strptime(from_time, '%Y-%m-%d')
        to_time = type(to_time) == datetime and to_time or datetime.strptime(to_time, '%Y-%m-%d')
        candles = []
        try:
            time_type = int(time_type)
            time_type = ("{}minute".format(time_type), "minute")[time_type == 1]
        except:
            pass
        while(True):
            next_time = from_time + timedelta(days=20)
            next_time = next_time if next_time < to_time else to_time
            url = self.url.format(instrument_token, time_type, from_time.strftime('%Y-%m-%d'), next_time.strftime('%Y-%m-%d'))
            from_time = next_time + timedelta(days=1)
            headers = {
                "X-Kite-Version": "3",
                "Authorization": self.auth
            }
            response = requests.get(url, headers=headers)
            data = json.loads(response.content.decode('utf-8'))
            while(data['status'] == 'error'):
                time.sleep(1)
                response = requests.get(url, headers=headers)
                data = json.loads(response.content.decode('utf-8'))
            data = data['data']['candles']
            candles.extend(data)
            if(from_time > to_time):
                break
        return candles
        
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
                i = i+1
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
    def __init__(self, timeperiod=1, max_candles=0):
        self.candles = []
        self.current_range = []
        self.timeperiod = timeperiod
        self.start_time = None
        self.current_time = None
        self.next_time = None
        self.max_candles = max_candles
        self.candles_count = 0
    
    def run_candling(self, timeperiod, callback, cargs):
        time.sleep(timeperiod)
        prev_candle = self.save_prev_candle()
        callback(self, prev_candle, cargs)
    
    def start_candling(self, timeperiod=60, callback=lambda x,y:x, cargs={}):
        self.timeperiod = timeperiod
        thread = Thread(target=self.run_candling, args=(timeperiod, callback, cargs))
        thread.start()
        
    def get_candles(self, start_index=0, end_index=0, direction=1):
        if(end_index == 0):
            return self.candles[start_index:]
        return self.candles[start_index:end_index:direction]

    def set_max_candles(self, max_candles=0):
        self.max_candles = max_candles

    def get_last_candles(self, count=1, offset=0):
        if(offset < 0):
            candles = self.candles[-count+offset:offset]
            candles.extend([{
                'high': len(self.current_range) > 0 and max(self.current_range) or 0,
                'low': len(self.current_range) > 0 and min(self.current_range) or 0,
                'open': len(self.current_range) > 0 and self.current_range[0] or 0,
                'close': len(self.current_range) > 0 and self.current_range[-1] or 0,
                'time': self.start_time.time()
            }])
            return candles
        else:
            candles = self.candles[-count:]
            candles.extend([{
                'high': max(self.current_range),
                'low': min(self.current_range),
                'open': self.current_range[0],
                'close': self.current_range[-1],
                'time': self.start_time.time()
            }])
            return candles

    def pop_extra_candles(self):
        while(self.max_candles and len(self.candles) > self.max_candles):
            self.candles.pop(0)
    
    def save_prev_candle(self):
        current_candle = {}
        current_candle['high'] = max(self.current_range)
        current_candle['low'] = min(self.current_range)
        current_candle['open'] = self.current_range[0]
        current_candle['close'] = self.current_range.pop()
        current_candle['time'] = self.start_time.time()
        self.pop_extra_candles()
        self.candles.append(current_candle)
        self.current_range = [current_candle['close']]
        self.next_time = self.current_time + timedelta(minutes=self.timeperiod)
        if(self.next_time.time() > dt.time(hour=15,minute=31, second=0)): #when the end time is reached, the addPrice should look for next time 9.15 of the next day
            next_time = dt.time(hour=9, minute=15, second=0)# + (self.next_time.time() - dt.time(hour=15,minute=30,second=0))
            self.next_time = self.next_time.replace(hour=next_time.hour, minute=next_time.minute, second=next_time.second)
            self.next_time = self.next_time + timedelta(minutes=self.timeperiod)
        self.candles_count = self.candles_count + 1
        return current_candle

    def load_candles(self, candles=[]):
        self.candles.extend(candles)
        self.pop_extra_candles()
        self.candles_count = len(self.candles)

    def load_prev_candles(self, candles=[]):
        candles.extend(self.candles)
        self.candles = candles
        self.pop_extra_candles()
        self.candles_count = len(self.candles)

    def add_candle(self, candle):
        self.candles.append(candle)
        self.pop_extra_candles()
        self.candles_count = self.candles_count + 1
        
    def add_price(self, price, time=None):
        price = float(price)
        time = int(time)
        if(self.start_time is None):
            self.start_time = datetime.fromtimestamp(time)
        if(self.current_time is None):
            self.current_time = datetime.fromtimestamp(time)
            self.next_time = (self.current_time + timedelta(minutes=self.timeperiod))
        else:
            self.current_time = datetime.fromtimestamp(time)
        self.current_range.append(price)
        if(self.current_time.time() >= self.next_time.time()):
            self.save_prev_candle()
            self.start_time = self.next_time - timedelta(minutes=self.timeperiod)
    
    def get_candles_count(self):
        return self.candles_count
    
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
            
    def nd_last_candles(self, count=1, offset=0):
        candles = self.get_last_candles(count=count, offset=offset)
        candles = {
            'open': np.array([candle['open'] for candle in candles]),
            'close': np.array([candle['close'] for candle in candles]),
            'high': np.array([candle['high'] for candle in candles]),
            'low': np.array([candle['low'] for candle in candles]),
            'volume': np.array([])
        }
        return candles

class Collector:
    def __init__(self, option):
        self.stocks = {}
        self.option = option

    def start_collector(self):
        for key in self.option:
            candles = Candles()
            self.stocks[key] = {
                'candles': candles
            }

    def collect_price(self, data):
        for d in data:
            stock = self.stocks[d.key]
            stock['candles'].add_price(d.price)

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
