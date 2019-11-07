from collections import defaultdict
from multiprocessing.connection import PipeConnection
from observer import Observer,Subject
from operands import Operand, Operation, create_operation
import pdb
import json
from datetime import datetime

class StrategyManager(Observer):
    '''
        Input of strategy manager will be the data feed
        Output of strategy manager gives the indication to the Main Trader
    '''

    def __init__(self, outputPipe=None, config={}):
        self.stocks = defaultdict(list)
        self.output = outputPipe

    def update(self, dataFeed:Subject):
        data = dataFeed.data
        output = self.output
        #delegate the data for a stock according to the respective strategies assigned
        for key in self.stocks:
            d = data #TODO parse data and append it to d
            for strategy in self.stocks[key]:
                if(int(d['token']) == int(strategy.args['token'])):
                    r = strategy.run(d)
                    if((output is not None) and (type(output) is PipeConnection) and r):
                        #send the result for the strategy, normally it will be indicators
                        #TODO should send what to do, buy or sell, too
                        request = {
                            'data': data
                        }
                        request.update(strategy.args)
                        output.send(request)

    def load_strategies(self, strategies):
        if(type(strategies) is dict):
            for k in strategies:
                self.stocks[k].append(self.create_strategy(strategies[k]))
        elif(type(strategies) is list):
            for s in strategies:
                self.stocks[s['stock']].append(self.create_strategy(s))

    def add_strategy(self, token, strategy):
        strategy = self.create_strategy(strategy)
        self.stocks[token].append(strategy)

    def remove_strategy(self, token, strategy):
        strategy = self.create_strategy(strategy)
        self.stocks[token].remove(strategy)

    def create_strategy(self, strategy):
        operation = create_operation(data=json.loads(strategy['operation']))
        bo = create_operation(data=json.loads(strategy['beginOn']))
        eo = create_operation(data=json.loads(strategy['endOn']))
        strategy = Strategy(
            operation=operation,
            begin_on=bo,
            end_on=eo,
            args = strategy)
        return strategy

class Strategy:
    def __init__(self, operation=None, begin_on=Operation(operator='none'), end_on=Operation(operator='none'), args={}):
        self.operation = operation
        self.phase = None
        #set conditions for when to begin and end, if no conditions is specified default will be taken
        self.begin_on = begin_on
        self.end_on = end_on
        self.phase = 'sleeping'
        self.args = args

    def begin(self):
        pass
    
    #TODO replace the begin calling with the decorator
    def run(self, data):
        #TODO change this as soon as you can !important
        data = {
            'price': data['lastPrice'],
            'time': data['t']
        }
        true = Operand(d=True)
        begin = (self.begin_on.update(data) == true).d
        end = (self.end_on.update(data) == true).d
        if(begin and not end):
            if(self.phase == 'sleeping'):
                self.begin()
                self.phase = 'running'
            return self.update(data)
        if(begin and end and self.phase == 'running'):
            self.end()
            self.phase = 'sleeping'
        return None

    def update(self, data):
        r = None
        if(self.operation):
            r = self.operation.update(data)
        return r

    def end(self):
        return True
