from datetime import datetime, timedelta
from data_feed import DataFeed,Observer
from threading import Thread

import datetime as dt
import pdb
import json
import time
import threading
import logging

logger = logging.getLogger("feedLogger")

class DataManager(Observer):
    '''saves the candle data into its required timeframes, get 1 min, save it to 1, 2, 5, 10, 15' timeframes based on token '''
    def __init__(self, history):
        self.candles = {} #dict with the form{[token]: {[timeframe]: [candles]}}
        self.upto = 1
        self.history = history

        #constants
        self.DAYS_CANDLES = "DAYS_CANDLES"

        #mapping
        self.filter_maps = {
            "DAYS_CANDLES": self.get_days_candles
        }

    def load_data(self, tokens, now=None):
        self.candles = {}
        to_time = from_time = None
        if(now is None):
            to_time = datetime.now()
            from_time = (datetime.now() - timedelta(days=3))
        else:
            to_time = now
            from_time = (now - timedelta(days=3))
        self.ref = datetime.combine(from_time, dt.time(hour=9, minute=15))

        #open some n threads and a list which contains the tokens
        #each thread, pop token from list and generate on self.candles
        threads = []
        lock = threading.Lock()
        for _ in range(5):
            thread = Thread(target=self.load_candles, args=(from_time, to_time, tokens, lock))
            thread.start()
            threads.append(thread)
        for t in threads:
            t.join()
        print("All data loaded")

    def load_candles(self, from_time, to_time, tokens, lock):
        while(True):
            lock.acquire()
            token = None
            if(len(tokens) > 0):
                token = tokens.pop()
            else:
                lock.release()
                break
            lock.release()
            self.candles[int(token)] = {"meta": {},1: [],2: [],5: [],10: [],15: []}
            print("Loading history for {}".format(token))
            candles = self.history.get_raw_data(token, 1, from_time.strftime('%Y-%m-%d'), to_time.strftime("%Y-%m-%d"))
            #this candles will be in 1 minute timeframe
            self.copy_across_timeframes(token, candles, self.candles.get(int(token)))
            self.candles.get(int(token))['meta'] = {'loaded': True}

    def copy_across_timeframes(self, token, candles, store_here):
        #use pandas? to combine the timeframe into the consolidated one - don't need that
        timeframes = [1, 2, 5, 10, 15]
        counts = {
            1: 0,
            2: 0,
            5: 0,
            10: 0,
            15: 0
        }
        for candle in candles:
            #use reference candle as day's starting 9:15
            cur = datetime.strptime(candle[0], '%Y-%m-%dT%H:%M:%S+0530')
            dif = cur - self.ref
            for time in timeframes:
                seconds = dif.seconds + (dif.days * 24 * 60 * 60)
                no_of_candles = int(seconds / (60 * time))
                if(no_of_candles >= counts[time] or time is 1):
                    cur_range = {}
                    cur_range['time'] = int(cur.timestamp())
                    cur_range['open'] = candle[1]
                    cur_range['high'] = candle[2]
                    cur_range['low'] = candle[3]
                    cur_range['close'] = candle[4]
                    store_here.get(time).append(cur_range)
                    counts[time] = no_of_candles + 1
                else:
                    cur_range['high'] = max(cur_range['high'], candle[2])
                    cur_range['low'] = min(cur_range['low'], candle[3])
                    cur_range['close'] = candle[4]

    def add_to_candle(self, token, timeperiod, price, time):
        # if(datetime.fromtimestamp(time).strftime("%H:%M %d-%m-%Y") == "10:11 23-04-2020"):
        #     pdb.set_trace()
        list_to_add = self.candles.get(int(token)).get(int(timeperiod))
        # if(len(list_to_add) == 0):
        #     list_to_add.append({
        #         'time': 
        #     })
        last_candle = list_to_add[-1]
        last_candle_time = last_candle['time']
        dif = datetime.fromtimestamp(int(time)) - datetime.fromtimestamp(int(last_candle_time))
    
        seconds = dif.seconds
        days = dif.days * 24 * 60 * 60
        seconds = days + seconds
        float_candles = seconds/(60 * timeperiod)
        approx = int(float_candles) * (60 * timeperiod)

        if(float_candles >= 1):
            #when canldes get updated, the actual csv should also be updated
            last_candle['close'] = float(price)
            list_to_add.append({
                'time': int(last_candle_time + approx),
                'open': float(price),
                'high': float(price),
                'low': float(price),
                'close': float(price)
            })
            self.upload_to_csv(token, timeperiod, list_to_add)
        else:
            last_candle['high'] = max(last_candle['high'], float(price))
            last_candle['low'] = min(last_candle['low'], float(price))
            last_candle['close'] = float(price)

    def get_candles(self, token, timeperiod, offset, count=1, filter_str=None):
        if(filter_str is not None):
            filter_func = self.filter_maps.get(filter_str)
            if(filter_func is not None):
                return filter_func(token, timeperiod, offset, count)
        candles = self.candles.get(int(token)).get(int(timeperiod))
        if(offset < 0):
            return candles[-count+offset: offset]
        else:
            return candles[-count:]

    #filters
    def get_days_candles(self, token, timeperiod, offset, count):
        #get the candles until the start of the day which is 9:15, so make offset as absolute
        offset = abs(offset+1)
        candles = self.candles.get(int(token)).get(int(timeperiod))
        if(len(candles) == 0):
            return 0
        from_candle = 0
        from_candle_time = int(datetime.combine(datetime.fromtimestamp(candles[-1]['time']), dt.time(hour=9, minute=15)).timestamp())
        for i in range(len(candles)-1, -1, -1):
            candle = candles[i]
            if(candle['time'] < from_candle_time):
                break
            from_candle = i
        return candles[from_candle:]

    def get_nd_candles(self, token, timeperiod, offset, count=1, filter_str=None):
        candles = self.get_candles(token, timeperiod, offset, count=count, filter_str=filter_str)
        result = {
            'open': [],
            'high': [],
            'low': [],
            'close': [],
            'time': []
        }
        for candle in candles:
            result['open'].append(candle['open'])
            result['high'].append(candle['high'])
            result['low'].append(candle['low'])
            result['close'].append(candle['close'])
            result['time'].append(candle['time'])
        return result

    def update(self, dataFeed:DataFeed):
        data = dataFeed.data
        timeperiods = [1, 2, 5, 10, 15]
        for timeperiod in timeperiods:
            self.add_to_candle(data['token'], timeperiod, data['lastPrice'], data['time'])

    def stop(self):
        self.candles = None

    def upload_to_csv(self, token, timeperiod, data):
        with open('candles/{}_{}.csv'.format(token, timeperiod), 'w+') as f:
            f.write('time,open,high,low,close\n')
            for candle in data:
                time = datetime.fromtimestamp(candle['time']).strftime('%d-%m-%Y %H:%M')
                f.write("{},{},{},{},{}\n".format(time, candle['open'], candle['high'], candle['low'], candle['close']))

#test for loading data from history for a particular token
#initially supplied with tokens
#then getting the 1 minute history data
#from 1 minute parse all 2,5,10,15 minutes into the store

#writing different tests for data manager
#how to supply initialized and loaded data_manager to each operands
#how to initialize data manager
#when to load data

#while adding the candles, if the count becomes greater than max_candle pop the last candle
#for 1 in 1 day, it will be - 7 * 60 * 60 = 25200 candles
#for 2 minutes = 12600
#for 5 minutes = 5040
#for 10 minutes = 2520
#for 15 minutes = 1680
#these much candles should be maintained

#need to find if a new candle is formed
#start websocket streaming on a round time, after starting websocket, load the history
