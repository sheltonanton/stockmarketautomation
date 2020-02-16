from mapping import operands, urls

#implementation specific imports
import numpy as np
import pandas as pd
import json
import asyncio
from autotrade import History, Candles
from datetime import datetime, timedelta
import datetime as dt
from talib import MACD, EMA, SMA, BBANDS, STOCHRSI
import pdb
import logging

#this class sould be used for just simple numbers
#should be ovverridden if indicators and some extra functionality to be used
bt_logger = logging.getLogger('backtestLogger')
class Operand:
    def __init__(self, d=None, p=None):
        self.p = p
        self.d = d

    #abstract method
    def update(self, data):
        #on each update, operand could update its state by modifying the d variable from which value
        #will be extracted and in turn updates the sub operands it has
        return self

    def add(self, other):
        return self + other

    def sub(self, other):
        return self - other

    def mul(self, other):
        return self * other

    def div(self, other):
        return self / other

    def lt(self, other):
        return self < other

    def gt(self, other):
        return self > other

    def le(self, other):
        return self <= other

    def ge(self, other):
        return self >= other

    def eq(self, other):
        return self == other

    def ne(self, other):
        return self != other

    def gand(self, other):
        return self & other

    def gor(self, other):
        return self | other

    def none(self, other):
        return None

    def ca(self, other):
        #performing calculations for finding the crossed above for both operands
        if(self.p is None or other.p is None or self.d is None or other.d is None):
            return Operand(d=False)
        c1 = self.p - other.p
        c2 = self.d - other.d
        if(c1 < 0 and c2 > 0):
            return Operand(d=True)
        return Operand(d=False)

    def cb(self, other):
        #perform calculations for finding the crossed below for both operands
        if(self.p is None or other.p is None or self.d is None or other.d is None):
            return Operand(d=False)
        c1 = self.p - other.p
        c2 = self.d - other.d
        if(c1 > 0 and c2 < 0):
            return Operand(d=True)
        return Operand(d=False)

    def setd(self, d):
        self.p = self.d
        self.d = d

    #private operand and comparsion operators ovverridden
    def __add__(self, other):
        result = self.d + other.d
        return Operand(d=result)

    def __sub__(self, other):
        result = self.d - other.d
        return Operand(d=result)

    def __mul__(self, other):
        result = self.d * other.d
        return Operand(d=result)

    def __truediv__(self, other):
        result = self.d / other.d
        return Operand(d=result)

    def __lt__(self, other):
        result = self.d < other.d
        return Operand(d=result)

    def __gt__(self, other):
        result = self.d > other.d
        return Operand(d=result)

    def __le__(self, other):
        result = self.d <= other.d
        return Operand(d=result)

    def __ge__(self, other):
        result = self.d >= other.d
        return Operand(d=result)

    def __eq__(self, other):
        result = self.d == other.d
        return Operand(d=result)

    def __ne__(self, other):
        result = self.d != other.d
        return Operand(d=result)

    def __and__(self, other):
        result = self.d & other.d
        return Operand(d=result)

    def __or__(self, other):
        result = self.d | other.d
        return Operand(d=result)

    def __str__(self):
        return "({},{})".format(self.p, self.d)

class Operation:
    def __init__(self,  operator=None, left_operand=None, right_operand=None, string=None):
        if(string is not None and type(string) is str):
            #parse the string and assign the respective operation
            (self.left, self.operator, self.right) = create_operation(string=string)
        else:
            self.left = left_operand
            self.right = right_operand
            self.operator = operator

    def update(self, data):
        #push the value to all operands and calculate it
        #left and right could be another sub operation
        self.l = self.left and self.left.update(data) #can be either an operation or operand
        self.r = self.right and self.right.update(data) #can be either an operation or operand
        if(self.right and self.left):
            r = getattr(self.l,self.operator)(self.r)
        elif(self.left and not self.right):
            r = self.l
        return r

    def __str__(self):
        if(self.right and self.left):
            return ("[{} {} {}]".format(self.left, self.operator, self.right))
        else:
            return ("[{}]".format(self.l))

def create_operation(string=None, data=None):
    if(data):
        x = data
        left = right = None
        if(type(x[0]) is list):
            left = create_operation(data=x[0])
        elif(type(x[0]) is dict):
            l = globals()[operands[x[0]['func']]]
            args = x[0]['args'] if x[0]['args'] else []
            left = l(args=args)
            
        if(len(x) == 3 and type(x[2]) is list):
            right = create_operation(data=x[2])
        elif(len(x) == 3 and type(x[2]) is dict):
            r = globals()[operands[x[2]['func']]]
            args = x[2]['args'] if x[2]['args'] else []
            right = r(args=args)
        operator = x[1] if(len(x) == 3) else None
        return Operation(left_operand=left, operator=operator, right_operand=right)

    if(string):
        (l, o, r) = [x.strip() for x in string.split(';')]
        la = [x.strip() for x in l[l.find("(")+1:l.find(")")].split(',')] if l.find("(") != -1 else []
        ra = [x.strip() for x in r[r.find("(")+1:r.find(")")].split(',')] if r.find("(") != -1 else []
        lc = globals()[operands[l.split("(")[0]]]
        rc = globals()[operands[r.split("(")[0]]]
        left = lc(args=la)
        right = rc(args=ra)
        operator = o
        return (left, operator, right)

#available data(price, time, token, open, high, low, close, isCandle) close=price, for trades data(type, lastPrice)
#overridden 
class Value(Operand):
    '''[args] (value)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.setd(int(args[0]))

    def update(self, d):
        Operand.update(self, d)
        return self

class Time(Operand):
    '''[args] (time)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.time = datetime.fromtimestamp(int(args[0])).time()
    
    def update(self, d):
        self.setd(self.time)
        return self

class Data(Operand):
    '''[args] (key for data)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.key = args[0]
    
    def update(self, d):
        value = d[self.key]
        if(self.key == 'time'):
            value = datetime.fromtimestamp(int(d['time'])).time()
        self.setd(value)
        return self

class Price(Operand):
    '''[args] (noise_factor)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.noise_factor = float(args[0])
    
    def update(self, d):
        t = d['type']
        v = (float(d['lastPrice']) - float(self.noise_factor)) if (t == 'sell') else (float(d['lastPrice']) + float(self.noise_factor))
        v = round(v, 2)
        self.setd(v)
        return self

class Candle(Operand):
    '''[args] (timeperiod) '''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.timeperiod = int(args[0]) or 1
        self.dictKey = args[1]
        self.prev = (len(args) > 2 and (int(args[2]) -1)) or -1
        self.candles = Candles(timeperiod=self.timeperiod)

    def update(self, d):
        if(not d.get('isCandle')):
            self.candles.add_price(d['price'], time=d['time'])
            candle = self.candles.get_last_candles(count=1)
            output = candle[0].get(self.dictKey) if candle else 0
            if(self.dictKey=='time'):
                if(not output):
                    output = datetime.strptime("06:00","%H:%M").time()
            self.setd(output)
        else:
            _open = d['open']
            _close = d['close']
            _high = d['high']
            _low = d['low']
            _interval = d['interval']
            _time = d['time']
            self.candles.add_price(_open, time = _time)
            self.candles.add_price(_high, time = _time)
            self.candles.add_price(_low, time = _time)
            self.candles.add_price(_close, time = _time + _interval)

            candle = self.candles.get_last_candles(count=abs(self.prev)+1)
            output = candle[self.prev].get(self.dictKey) if candle else 0
            output = d.get(self.dictKey)
            self.setd(output)
        return self

    def candle_formed(self, candle, t):
        print(candle)
        print(t)

    # def __str__(self):
    #     candle = self.candles.get_last_candles(count=1)[0]
    #     return "Candle({},{},{},{},{})".format(candle.get('open'), candle.get('high'), candle.get('low'), candle.get('close'), candle.get('time'))

#make this async
#for now loading the data on the rounded time
history = None
def get_history(timetype, fromtime, totime, instrument_token):
    global history
    if(history == None):
        history = History(url=urls['history_url'], instruments=None)
    data = history.get_raw_data(instrument_token, timetype, fromtime, totime)
    candles = []
    for d in data:
        a = {}
        a['time'],a['open'],a['high'],a['low'],a['close'],a['volume'] = d
        a['time'] = datetime.strptime(a['time'],'%Y-%m-%dT%H:%M:%S+0530').timestamp()
        candles.append(a)
    return candles

class HistorisedCandle(Candle):
    def __init__(self, args=[]):
        Candle.__init__(self, args)
        self.candles.set_max_candles(max_candles=200)
        self.candles_count = 0
    
    def update(self, d):
        #started recording the data
        #after rounding off, get the history data
        #after obtaining the history data, find the end one and combine the recently collected data
        #if not repeat the step
        #temporary - calculating the next round time

        # if not self.has_loaded and not self.needed:
        #     current_time = datetime.fromtimestamp(int(d.get('time')))
        #     start_time = datetime.combine(current_time.date(), dt.time(hour=9, minute=15))
        #     timestamp = start_time.timestamp()
        #     rem = (int(current_time.timestamp() - timestamp) % int(self.timeperiod * 60))
        #     self.needed = int(current_time.timestamp() + (self.timeperiod * 60) - rem)

        # if(self.needed and int(d.get('time')) >= int(self.needed-2) and not self.has_loaded):
        #     self.has_loaded = True
        #     self.get_history(d)
        # if(self.has_loaded):
        self.last_price = d['price']
        Candle.update(self, d)
        return self

    def get_history(self, d):
        tt = datetime.fromtimestamp(int(d.get('time')))
        ft = (tt - timedelta(days=1))
        totime = tt.strftime("%Y-%m-%d")
        fromtime = ft.strftime("%Y-%m-%d")
        candles = get_history(self.timeperiod, fromtime,totime, int(d.get('token')))
        while(datetime.fromtimestamp(int(candles[-1].get('time'))) >= tt):
            candles.pop()
        self.candles.load_prev_candles(candles)
        self.candles_count = self.candles.get_candles_count()

    def is_new_candle_formed(self):
        value = (self.candles.get_candles_count() > self.candles_count)
        self.candles_count = self.candles.get_candles_count()
        return value

class MovingAverageConvergenceDivergence(HistorisedCandle):
    '''[args] (fastperiod, slowperiod, signalperiod, output) '''

    def __init__(self, args=[]):
        HistorisedCandle.__init__(self, [args[0], 'close'])
        self.fastperiod = float(args[1]) or 12
        self.slowperiod = float(args[2]) or 26
        self.signalperiod = float(args[3]) or 9
        #load candle with previous data for slowperiod + signalperiod
        self.output = args[4] or 'macd'
        self.keys = {'macd': 0, 'signal': 1, 'hist': 2}
        self.k = self.keys.get(self.output) or 0
        self.has_loaded = False

    def update(self, data):
        d = self.d
        HistorisedCandle.update(self, data)
        if(self.is_new_candle_formed()):
            data = self.candles.nd_last_candles(count=200)
            r = None
            try:
                r = MACD(data['close'], self.fastperiod,
                        self.slowperiod, self.signalperiod)
            except:
                r = {self.k : [0]}
                print("Exception")

            self.d = 0 if np.isnan(r[self.k][-1]) else r[self.k][-1]
            if(len(r[self.k]) == 1):
                self.p = 0
            else:
                self.p = 0 if np.isnan(r[self.k][-2]) else r[self.k][-2]
        else:
            self.d = 0 if not d else d
            self.p = self.d
        return self

    def __str__(self):
        operand = Operand.__str__(self)
        return "MACD({},{},{},{}){} - data {}".format(self.fastperiod, self.slowperiod, self.signalperiod, self.output, operand, self.last_price)


class ExponentialMovingAverage(HistorisedCandle):
    def __init__(self, args=[]):
        HistorisedCandle.__init__(self, [args[0], args[1]])
        self.period = int(args[2]) or 20
    
    def update(self, data):
        d = self.d
        HistorisedCandle.update(self, data)
        if(self.is_new_candle_formed()):
            data = self.candles.nd_last_candles(count=200)
            r = None
            try:
                r = EMA(data['close'], timeperiod=self.period)
            except:
                print("Exception in ExponentialMovingAverage")
                r = [0,0]
            #need to set self.d and self.p for calcualtion of crossover
            self.d = 0 if np.isnan(r[-1]) else r[-1]
            if(len(r) > 1):
                self.p = 0 if np.isnan(r[-2]) else r[-2]
            else:
                self.p = 0
        else:
            self.d = 0 if not d else d
            self.p = self.d
        return self

    def __str__(self):
        operand = Operand.__str__(self)
        return "EMA({},{}){} - data {}".format(self.timeperiod, self.period, operand, self.last_price)


class SimpleMovingAverage(HistorisedCandle):
    def __init__(self, args=[]):
        HistorisedCandle.__init__(self, [args[0], args[1]])
        self.period = int(args[2]) or 20

    def update(self, data):
        d = self.d
        HistorisedCandle.update(self, data)
        if(self.is_new_candle_formed()):
            data = self.candles.nd_last_candles(count=300)
            r = None
            try:
                r = SMA(data['close'], self.period)
            except:
                print("Exception in SimpleMovingAverage")
                r = [0,0]
            self.d = 0 if np.isnan(r[-1]) else r[-1]
            if(len(r) > 1):
                self.p = 0 if np.isnan(r[-2]) else r[-2]
            else:
                self.p = 0
        else:
            self.d = 0 if not d else d
            self.p = self.d
        return self

    def __str__(self):
        operand = Operand.__str__(self)
        return "SMA({},{}){} - data {}".format(self.timeperiod, self.period, operand, self.last_price)

class BollingerBands(HistorisedCandle):
    def __init__(self, args=[]):
        self.live = bool(int(args.pop())) or False
        self.output = str(args.pop()) or 'uband'
        self.period = int(args.pop()) or 20
        self.nbdevup = int(args.pop()) or 2
        self.nbdevdn = int(args.pop()) or 2
        HistorisedCandle.__init__(self, args)
        self.keys = {'uband': 0, 'mband':1, 'lband': 2}
        self.matype = 0
        self.k = self.keys.get(self.output) or 0

    def update(self, data):
        if(not self.live):
            d = self.d
            HistorisedCandle.update(self, data)
            if self.is_new_candle_formed():
                data = self.candles.nd_last_candles(count=200)
                self.process_data(data)
            else:
                self.d = 0 if not d else d
                self.p = self.d
        else:
            if data.get("isCandle"):
                d = data['close']
            else:
                d = data['price']
            d = {'close': np.append(self.candles.nd_last_candles(count=200)['close'], d)}
            HistorisedCandle.update(self, data)
            self.process_data(d)
        return self

    def process_data(self, data):
        r = None
        try:
            r = BBANDS(data['close'], timeperiod=self.period, nbdevup=self.nbdevup, nbdevdn=self.nbdevdn, matype=self.matype)
        except:
            print("Exception in BollingerBands")
            r = {self.k: [0,0]}
        self.d = 0 if np.isnan(r[self.k][-1]) else r[self.k][-1]
        if(len(r[self.k]) > 1):
            self.p = 0 if np.isnan(r[self.k][-2]) else r[self.k][-2]
        else:
            self.p = 0
        return self

    def __str__(self):
        operand = Operand.__str__(self)
        return "BBANDS({},{},{},{}){} - data {}".format(self.period, self.nbdevup, self.nbdevdn, self.output, operand, self.last_price)

class StochasticRelativeStrengthIndex(HistorisedCandle):
    def __init__(self, args=[]):
        self.live = bool(int(args.pop())) or False
        self.output = str(args.pop()) or 'fastk'
        self.fastdperiod = int(args.pop()) or 3
        self.fastkperiod = int(args.pop()) or 5
        self.period = int(args.pop()) or 14
        HistorisedCandle.__init__(self, args)
        self.keys = {'fastk': 0, 'fastd': 1}
        self.k = self.keys.get(self.output) or 0
        self.fastdmatype = 0

    def update(self, data):
        if(not self.live):
            d = self.d
            HistorisedCandle.update(self, data)
            if self.is_new_candle_formed():
                data = self.candles.nd_last_candles(count=200)
                self.process_data(data)
            else:
                self.d = 0 if not d else d
                self.p = self.d
        else:
            if data.get("isCandle"):
                d = data['close']
            else:
                d = data['price']
            d = {'close': np.append(self.candles.nd_last_candles(count=200)['close'], d)}
            HistorisedCandle.update(self, data)
            self.process_data(d)
        return self

    def process_data(self, data):
        r = None
        try:
            r = STOCHRSI(data['close'], timeperiod=self.period, fastk_period=self.fastkperiod, fastd_period=self.fastdperiod, fastd_matype=self.fastdmatype)
        except:
            bt_logger.exception()
            r = {self.k: [0,0]}
        self.d = 0 if np.isnan(r[self.k][-1]) else r[self.k][-1]
        if len(r[self.k]) > 1:
            self.p = 0 if np.isnan(r[self.k][-2]) else r[self.k][-2]
        else:
            self.p = 0

    def __str__(self):
        operand = Operand.__str__(self)
        return "STOCHASTICS({},{},{}){} - data {}".format(self.period, self.fastkperiod, self.fastdperiod, operand, self.last_price)
