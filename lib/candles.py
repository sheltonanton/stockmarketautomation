import numpy as np
import time
from threading import Thread

class Candles:
    def __init__(self, period=5):
        self.candles = []
        self.period = period
        self.index = 0
        self.current_range = []
    
    def run_candling(self, timeperiod, start_price):
        time.sleep(timeperiod)
        self.save_prev_candle()
        
    def callback(self):
        pass
    
    def start_candling(self, timeperiod=0, start_price=0, callback=callback):
        self.callback = callback
        self.timeperiod = timeperiod
        if(start_price): 
            self.current_range.append(start_price)
        thread = Thread(target=self.run_candling, args=(timeperiod, start_price))
        thread.run()
        
    def get_candles(self, start_index=0, end_index=0):
        if(end_index == 0):
            return self.candles[start_index:]
        return self.candles[start_index:end_index]

    def get_last_candles(self, count=1):
        return self.candles[-count:]
    
    def save_prev_candle(self):
        self.index = 0
        current_candle = {}
        current_candle['high'] = max(self.current_range)
        current_candle['low'] = min(self.current_range)
        current_candle['open'] = self.current_range[0]
        current_candle['close'] = self.current_range.pop()
        self.candles.append(current_candle)
        self.callback(current_candle, time.time_ns())
        self.current_range = []
        
    def add_price(self, price):
        self.current_range.append(price)
        self.index = self.index + 1
        if(self.index == self.period and not self.timeperiod):
            self.save_prev_candle()
    
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