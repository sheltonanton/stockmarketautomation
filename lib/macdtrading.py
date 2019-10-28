import numpy as np
from talib import MACD
from autotrade import Candles
from observer import Observer, Subject

class MACDStrategy(Observer):
    '''
        MACD strategy
        MACD cross above signal line, buy it, MACD cross below signal line, sell it
        -- simple
    '''

    def __init__(self, tokens=[], stocks=[], config={}):
        self.quantity = config.get("quantity") or 1
        self.timeperiods = config.get("timeperiods") or [1]
        self.phases = []
        for t in self.timeperiods:
            phase = Phase(name='phase-{}'.format(t), config=config, stock_names=stocks)

    def update(self, dataFeed:Subject):
        #Iterate through time period
        ##Iterate through stocks
        ###each stock has MACD running parallel
        data = dataFeed.data
        for phase in self.phases:
            phase.update(data)

    def removed(self):
        #before removing every orders should be exited
        for phase in self.phases:
            phase.removed()
        pass

class Phase:
    def __init__(self, name='phase', config={}, stock_names=[]):
        self.name = name
        self.stock_names = stock_names
        self.config = config
        self.stocks = {}
        self.orders = []
    
    #following two functions are used to track the beginning and the end of the day
    def begin(self):
        stock_names = self.stock_names
        config = self.config
        for n in stock_names:
            
            self.stocks[n['token']] = {
                'name': n['name']
            }
        for token in self.stocks:
            macd = MovingAverageConvergenceDivergence(
                fastperiod=config.get('fastperiod') or 12,
                slowperiod=config.get('slowperiod') or 26,
                signalperiod=config.get('signalperiod') or 9,
                ca=config['ca'],
                cb=config['cb']
            )
            candles = Candles()
            candles.start_candling(
                timeperiod=self.config['t']*60, 
                callback=self.macd_candle_couple,
                cargs = {'macd': macd}
            )
            stock = self.stocks[token]
            stock['macd'] = macd
            stock['candles'] = candles

    def end(self):
        for token in self.stocks:
            stock = self.stocks[token]
            macd = stock['macd']
    #end

    def update(self, data):
        stock = self.stocks.get(data['token'])
        if(stock):
            pass

    def removed(self):
        print("Removed Phase: {}".format(self.name))

    def get_orders(self):
        return self.orders

    def macd_candle_couple(self, ref, candle, cargs):
        macd = cargs.get('macd')
        if(macd):
            macd.update(candle.get('close'))

class MovingAverageConvergenceDivergence:
    def __init__(self, fastperiod, slowperiod, signalperiod, ca=None, cb=None):
        self.fastperiod = fastperiod
        self.slowperiod = slowperiod
        self.signalperiod = signalperiod
        self.data = np.array([])
        self.ca = ca
        self.cb = cb

    def update(self, d):
        self.pc = None
        np.append(self.data, d)
        macd, sigl = MACD(self.data, self.fastperiod, self.slowperiod, self.signalperiod)
        m = macd(len(macd) -1)
        s = sigl(len(sigl) -1)
        if(not np.isnan(m)):
            pc = m - s
            if(pc <= 0 and self.pc > 0):
                #crossed below of signal
                if(self.ca is not None):
                    self.ca({'m':m, 'd':d})
            elif(pc >=0 and self.pc < 0):
                #crossed above of signal
                if(self.cb is not None):
                    self.cb({'m':m, 'd':d})
            self.pc = pc

#TODO later should be combined with the Trader class
class OrderMan:


        
