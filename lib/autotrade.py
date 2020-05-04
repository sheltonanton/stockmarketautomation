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