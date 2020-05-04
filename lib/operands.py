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
import math

#this class sould be used for just simple numbers
#should be ovverridden if indicators and some extra functionality to be used
bt_logger = logging.getLogger('backtestLogger')
logger = logging.getLogger('flowLogger')
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

class Default(Operand):
    def __init__(self, args=[]):
        self.args = args

    def update(self, d):
        self.setd(d)
        return self

class Operation:
    def __init__(self,  operator=None, left_operand=None, right_operand=None, string=None):
        if(string is not None and type(string) is str):
            #parse the string and assign the respective operation
            (self.left, self.operator, self.right) = create_operation(string=string, dataline=None)
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

def create_operation(string=None, data=None, dataline=None):
    if(data):
        x = data
        left = right = None
        if(type(x[0]) is list):
            left = create_operation(data=x[0], dataline=dataline)
        elif(type(x[0]) is dict):
            l = Default
            if(operands.get(x[0]['func']) is not None):
                l = globals()[operands[x[0]['func']]]
            args = x[0]['args'] if x[0]['args'] else []
            left = l(args=args)
            left.dataline = dataline
            
        if(len(x) == 3 and type(x[2]) is list):
            right = create_operation(data=x[2], dataline=dataline)
        elif(len(x) == 3 and type(x[2]) is dict):
            r = Default
            if(operands.get(x[2]['func']) is not None):
                r = globals()[operands[x[2]['func']]]
            args = x[2]['args'] if x[2]['args'] else []
            right = r(args=args)
            right.dataline = dataline
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
#constant value
class Value(Operand):
    '''[args] (value)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.setd(float(args[0]))

    def update(self, d):
        Operand.update(self, d)
        return self
#for now, it should be given as a epoch time, change it to datatime string, for processing time
class Time(Operand):
    '''[args] (time)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.time = datetime.fromtimestamp(int(args[0])).time()
    
    def update(self, d):
        self.setd(self.time)
        return self

#there are many fields within the supplied data object, performing operation on such requires this
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

#noise factor specification, name should be changed to somewhat meaningful
class Price(Operand):
    '''[args] (noise_factor)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.noise_factor = float(args[0])
    
    def update(self, d):
        t = 'sell'
        v = (float(d['lastPrice']) - float(self.noise_factor)) if (t == 'sell') else (float(d['lastPrice']) + float(self.noise_factor))
        v = round(v, 2)
        self.setd(v)
        return self

#percent calculation
class Percent(Operand):
    '''[args] (number)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.percent = float(args[0])

    def update(self, d):
        price = float(d['lastPrice'])
        self.setd(round(math.floor((price * (self.percent / 100))/0.05) * 0.05, 2))
        return self

class Candle(Operand):
    '''[args] (timeperiod) '''
    def __init__(self, args=[]):
        Operand.__init__(self)
        length = len(args)
        self.timeperiod = length > 0 and int(args[0]) or 1
        self.dictKey = length > 1 and args[1] or 'close'
        self.prev = length > 2 and int(args[2]) or 0
        self.dataline = None
        self.candle = None

    def update(self, d):
        self.last_price = d['lastPrice']
        #get candle data with token, timeperiod, offset and count
        candles = self.dataline.get_candles(d['token'], self.timeperiod, self.prev)
        output = (len(candles) > 0) and candles[0][self.dictKey] or 0
        if(self.dictKey == 'time'):
            output = (len(candles) > 0) and int(candles[0]['time']) or int(d['time'])
        self.setd(output)
        self.candle = (len(candles) > 0) and candles[0] or None
        return self

    def __str__(self):
        if(self.candle is not None):
            candle = self.candle
            return "Candle({},{},{},{},{},{},{})".format(self.prev, self.dictKey, candle.get('open'), candle.get('high'), candle.get('low'), candle.get('close'), candle.get('time'))
        return "Candle({},{},{},{},{})".format(0,0,0,0,0)


class Max(Candle):
    ''' Gives the maximum y of the x candles '''

    def __init__(self, args=[]):
        Candle.__init__(self, args)
        self.period = (len(args) > 3) and int(args[3]) or 20

    def update(self, data):
        Candle.update(self, data)
        candles = self.dataline.get_nd_candles(data['token'], self.timeperiod, self.prev, count=self.period)
        self.setd(max(candles[self.dictKey] if len(candles[self.dictKey]) else [0]))
        return self

    def __str__(self):
        return "Max({}, {}, {}, {}) - {}".format(self.prev, self.timeperiod, self.dictKey, self.period, self.d)

class Min(Candle):
    '''Gives the minimum y or the x candles '''
    
    def __init__(self, args=[]):
        Candle.__init__(self, args)
        self.period = (len(args) > 3) and int(args[3]) or 20

    def update(self, data):
        Candle.update(self, data)
        candles = self.dataline.get_nd_candles(data['token'], self.timeperiod, self.prev, count=self.period)
        self.setd(min(candles[self.dictKey] if len(candles[self.dictKey]) > 0 else [0]))
        return self

    def __str__(self):
        return "Min({}, {}, {}, {}) - {}".format(self.prev, self.timeperiod, self.dictKey, self.period, self.d)

class DaysHigh(Candle):
    '''Gives the days high '''
    def __init__(self, args=[]):
        if(len(args) > 1):
            args = args[0:1] + ['high'] + args[1:]
        Candle.__init__(self, args)
        
    def update(self, data):
        Candle.update(self, data)
        candles = self.dataline.get_nd_candles(
            data['token'], self.timeperiod, self.prev, filter_str=self.dataline.DAYS_CANDLES)
        self.setd(max(candles[self.dictKey] if len(candles['high']) > 0 else [0]))
        return self

class DaysLow(Candle):
    '''Gives the days low '''
    def __init__(self, args=[]):
        if(len(args) > 1):
            args = args[0:1] + ['low'] + args[1:]
        Candle.__init__(self, args)

    def update(self, data):
        Candle.update(self, data)
        candles = self.dataline.get_nd_candles(
            data['token'], self.timeperiod, self.prev, filter_str=self.dataline.DAYS_CANLDES)
        self.setd(min(candles[self.dictKey] if len(candles['low']) > 0 else [0]))
        return self

class MovingAverageConvergenceDivergence(Candle):
    '''[args] (fastperiod, slowperiod, signalperiod, output) '''

    def __init__(self, args=[]):
        Candle.__init__(self, [args[0], 'close', 0])
        self.fastperiod = float(args[1]) or 12
        self.slowperiod = float(args[2]) or 26
        self.signalperiod = float(args[3]) or 9
        #load candle with previous data for slowperiod + signalperiod
        self.output = args[4] or 'macd'
        self.keys = {'macd': 0, 'signal': 1, 'hist': 2}
        self.k = self.keys.get(self.output) or 0
        # self.has_loaded = False

    def update(self, data):
        Candle.update(self, data)
        candles = self.dataline.get_nd_candles(
            data['token'], self.timeperiod, self.prev, count=200)
        r = None
        try:
            r = MACD(np.array(candles['close']), self.fastperiod,
                    self.slowperiod, self.signalperiod)
        except:
            r = {self.k : [0]}
            print("Exception")

        self.setd(0 if np.isnan(r[self.k][-1]) else r[self.k][-1])
        return self

    def __str__(self):
        operand = Operand.__str__(self)
        return "MACD({},{},{},{}){} - data {}".format(self.fastperiod, self.slowperiod, self.signalperiod, self.output, operand, self.d)


class ExponentialMovingAverage(Candle):
    def __init__(self, args=[]):
        Candle.__init__(self, [args[0], 'close', 0])
        self.period = int(args[2]) or 20
    
    def update(self, data):
        Candle.update(self, data)
        candles = self.dataline.get_nd_candles(
            data['token'], self.timeperiod, self.prev, count=200)
        r = None
        try:
            r = EMA(np.array(candles['close']), timeperiod=self.period)
        except:
            print("Exception in ExponentialMovingAverage")
            r = [0,0]
        #need to set self.d and self.p for calcualtion of crossover
        self.setd(0 if np.isnan(r[-1]) else r[-1])
        return self

    def __str__(self):
        operand = Operand.__str__(self)
        return "EMA({},{}){} - data {}".format(self.timeperiod, self.period, operand, self.d)


class SimpleMovingAverage(Candle):
    def __init__(self, args=[]):
        Candle.__init__(self, [args[0], 'close', 0])
        self.period = int(args[2]) or 20

    def update(self, data):
        Candle.update(self, data)
        candles = self.dataline.get_nd_candles(
            data['token'], self.timeperiod, self.prev, count=200)
        r = None
        try:
            r = SMA(np.array(candles['close']), self.period)
        except:
            print("Exception in SimpleMovingAverage")
            r = [0,0]
        self.setd(0 if np.isnan(r[-1]) else r[-1])
        return self

    def __str__(self):
        operand = Operand.__str__(self)
        return "SMA({},{}){} - data {}".format(self.timeperiod, self.period, operand, self.d)

class BollingerBands(Candle):
    def __init__(self, args=[]):
        Candle.__init__(self, [args[0], 'close', 0])
        self.live = bool(int(args.pop())) or False
        self.output = str(args.pop()) or 'uband'
        self.period = int(args.pop()) or 20
        self.nbdevup = int(args.pop()) or 2
        self.nbdevdn = int(args.pop()) or 2
        self.keys = {'uband': 0, 'mband':1, 'lband': 2}
        self.matype = 0
        self.k = self.keys.get(self.output) or 0

    def update(self, data):
        Candle.update(self, data)
        candles = self.dataline.get_nd_candles(
            data['token'], self.timeperiod, self.prev, count=200)
        return self.process_data(candles)

    def process_data(self, data):
        r = None
        try:
            r = BBANDS(np.array(data['close']), timeperiod=self.period, nbdevup=self.nbdevup, nbdevdn=self.nbdevdn, matype=self.matype)
        except Exception as e:
            print("Exception in BollingerBands", e)
            logger.exception(e)
            r = {self.k: [0,0]}
        self.setd(0 if np.isnan(r[self.k][-1]) else r[self.k][-1])
        return self

    def __str__(self):
        operand = Operand.__str__(self)
        return "BBANDS({},{},{},{}){} - data {}".format(self.period, self.nbdevup, self.nbdevdn, self.output, operand, self.d)

class StochasticRelativeStrengthIndex(Candle):
    def __init__(self, args=[]):
        Candle.__init__(self, [args[0], 'close', 0])
        self.live = bool(int(args.pop())) or False
        self.output = str(args.pop()) or 'fastk'
        self.fastdperiod = int(args.pop()) or 3
        self.fastkperiod = int(args.pop()) or 5
        self.period = int(args.pop()) or 14
        self.keys = {'fastk': 0, 'fastd': 1}
        self.k = self.keys.get(self.output) or 0
        self.fastdmatype = 0

    def update(self, data):
        Candle.update(self, data)
        candles = self.dataline.get_nd_candles(
            data['token'], self.timeperiod, self.prev, count=200)
        return self.process_data(candles)

    def process_data(self, data):
        r = None
        try:
            r = STOCHRSI(np.array(data['close']), timeperiod=self.period, fastk_period=self.fastkperiod, fastd_period=self.fastdperiod, fastd_matype=self.fastdmatype)
        except:
            bt_logger.exception()
            r = {self.k: [0,0]}
        self.setd(0 if np.isnan(r[self.k][-1]) else r[self.k][-1])
        return self

    def __str__(self):
        operand = Operand.__str__(self)
        return "STOCHASTICS({},{},{}){} - data {}".format(self.period, self.fastkperiod, self.fastdperiod, operand, self.d)
