from mapping import operands

#implementation specific imports
import numpy as np
import json
from autotrade import Candles
from datetime import datetime
from talib import MACD
import pdb

#this class sould be used for just simple numbers
#should be ovverridden if indicators and some extra functionality to be used

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
            return False
        c1 = self.p - other.p
        c2 = self.d - other.d
        if(c1 < 0 and c2 > 0):
            return Operand(d=True)
        return Operand(d=False)

    def cb(self, other):
        #perform calculations for finding the crossed below for both operands
        if(self.p is None or other.p is None or self.d is None or other.d is None):
            return False
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

    # def __str__(self):
    #     return "D:{},P:{}".format(self.p, self.d)

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
        l = self.left and self.left.update(data) #can be either an operation or operand
        r = self.right and self.right.update(data) #can be either an operation or operand
        if(self.right and self.left):
            r = getattr(l,self.operator)(r)
        elif(self.left and not self.right):
            r = l
        return r

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

#overridden operands
class Value(Operand):
    '''[args] (value)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.setd(args[0])

    def update(self, d):
        return self

class Time(Operand):
    '''[args] (time)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.time = datetime.fromtimestamp(int(args[0])).time()
    
    def update(self, d):
        self.setd(self.time)
        return self

class Price(Operand):
    '''[args] (noise_factor)'''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.noise_factor = args[0]
    
    def update(self, d):
        t = d['type']
        v = (float(d['lastPrice']) - float(self.noise_factor)) if (t == 'sell') else (float(d['lastPrice']) + float(self.noise_factor))
        self.setd(v)
        return self

class Candle(Operand):
    '''[args] (timeperiod) '''
    def __init__(self, args=[]):
        Operand.__init__(self)
        self.timeperiod = int(args[0]) or 1
        self.dictKey = args[1]
        self.candles = Candles(timeperiod=self.timeperiod)

    def update(self, d):
        self.candles.add_price(d['price'], time=d['time'])
        candle = self.candles.get_last_candles(count=1)
        output = candle[0].get(self.dictKey) if candle else 0
        if(self.dictKey=='time'):
            if(not output):
                output = datetime.strptime("06:00","%H:%M").time()
        self.setd(output)
        return self

    def candle_formed(self, candle, t):
        print(candle)
        print(t)

    # def __str__(self):
    #     candle = self.candles.get_last_candles(count=1)[0]
    #     return "Candle({},{},{},{},{})".format(candle.get('open'), candle.get('high'), candle.get('low'), candle.get('close'), candle.get('time'))


class MovingAverageConvergenceDivergence(Candle):
    '''[args] (fastperiod, slowperiod, signalperiod, output) '''

    def __init__(self, args=[]):
        Candle.__init__(self, [args[0],'close'])
        self.fastperiod = float(args[1]) or 12
        self.slowperiod = float(args[2]) or 26
        self.signalperiod = float(args[3]) or 9
        self.output = args[4] or 'macd'
        self.keys = {'macd': 0, 'signal': 1, 'hist': 2}
        self.k = self.keys.get(self.output) or 0
        self.data = np.array([])

    def update(self, d):
        Candle.update(self, d)
        if(self.candles.get_candles_count() > len(self.data)):
            candle = self.candles.get_last_candles(count=1)[0]
            candle['time'] = candle['time'].strftime("%H:%M") if candle else []
            self.data = np.append(self.data, self.d)
            r = None
            try:
                r = MACD(self.data, self.fastperiod,
                        self.slowperiod, self.signalperiod)
            except:
                r = {self.k : [0]}
                print("Exception")

            self.d = 0 if np.isnan(r[self.k][-1]) else r[self.k][-1]
            if(len(r[self.k]) == 1):
                self.p = 0
            else:
                self.p = 0 if np.isnan(r[self.k][-2]) else r[self.k][-2]
            return self
        self.p = 0
        self.d = 0
        return self

    def __str__(self):
        return "MACD({},{},{},{})".format(self.fastperiod, self.slowperiod, self.signalperiod, self.output)
