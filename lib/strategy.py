from collections import defaultdict
from multiprocessing.connection import PipeConnection
from observer import Observer, Subject
from operands import Operand, Operation, create_operation
import pdb
import json
from datetime import datetime
import logging
from trader import lt
import matplotlib.pyplot as plt

logger = logging.getLogger('flowLogger')
feedLogger = logging.getLogger('feedLogger')


class StrategyManager(Observer):
    '''
        Input of strategy manager will be the data feed
        Output of strategy manager gives the indication to the Main Trader
    '''

    def __init__(self, outputPipe=None, dataManager=None, config={}):
        self.stocks = defaultdict(list)
        self.output = outputPipe
        self.count = 0
        self.dataManager = dataManager

    def update(self, dataFeed: Subject):
        data = dataFeed.data
        output = self.output
        #delegate the data for a stock according to the respective strategies assigned
        for key in self.stocks:
            d = data  # TODO parse data and append it to d
            if(int(key) == int(d['token'])):
                for strategy in self.stocks[key]:
                    try:
                        r = strategy.run(d)
                        if((output is not None) and r and r.d == True):
                            #send the result for the strategy, normally it will be indicators
                            #TODO should send what to do, buy or sell, too
                            # logger.info("Signal Generated: {} - {}".format(d['token'], strategy.name))
                            request = {
                                'data': data
                            }
                            request.update(strategy.args)
                            output.put(request)
                            # logger.info("Pushed into queue: {} - {} {}".format(lt(data['time']), strategy.args['name'], json.dumps(data)))
                            self.count = self.count + 1
                    except Exception as e:
                        print("Exception in Strategy {}".format(
                            strategy.args['name']))
                        logger.exception(e)
                        logger.exception(strategy.operation)
                        # preventing the affected strategy from executing further
                        self.stocks[key].remove(strategy)

    def load_strategies(self, strategies):
        self.stocks = defaultdict(list)
        if(type(strategies) is dict):
            for k in strategies:
                self.stocks[k].append(self.create_strategy(strategies[k]))
        elif(type(strategies) is list):
            for s in strategies:
                self.stocks[s['token']].append(self.create_strategy(s))

    def add_strategy(self, token, strategy):
        strategy = self.create_strategy(strategy)
        self.stocks[token].append(strategy)

    def remove_strategy(self, token, strategy):
        self.stocks[token].remove(strategy)

    def create_strategy(self, strategy):
        operation = create_operation(data=json.loads(
            strategy['operation']), dataline=self.dataManager)
        bo = create_operation(data=json.loads(
            strategy['beginOn']), dataline=self.dataManager)
        eo = create_operation(data=json.loads(
            strategy['endOn']), dataline=self.dataManager)
        strategy = Strategy(
            operation=operation,
            begin_on=bo,
            end_on=eo,
            args=strategy,)
        return strategy


class Strategy:
    def __init__(self, operation=None, begin_on=Operation(operator='none'), end_on=Operation(operator='none'), args={}, name=None):
        self.name = (name or args.get('name') or 'Strategy')
        self.operation = operation
        self.phase = None
        #set conditions for when to begin and end, if no conditions is specified default will be taken
        self.begin_on = begin_on
        self.end_on = end_on
        self.phase = 'sleeping'
        self.args = args

    def begin(self, data):
        # print("B - {} - {}".format(data['token'], datetime.fromtimestamp(int(data.get('time'))).strftime("%d-%m-%Y %H:%M:%S")))
        return

    def end(self, data):
        # print("E - {} - {}".format(data['token'], datetime.fromtimestamp(int(data.get('time'))).strftime("%d-%m-%Y %H:%M:%S")))
        return

    #TODO replace the begin calling with the decorator
    def run(self, data):
        d = {
            'price': data['lastPrice'],
            'time': data['time'],
            'token': data['token'],
            'lastPrice': data['lastPrice']  # TODO change to common as price
        }
        if(data.get('isCandle')):
            d.update({
                'open': data['open'],
                'high': data['high'],
                'low': data['low'],
                'close': data['close'],
                'interval': data['interval'],
                'isCandle': data['isCandle']
            })
        #TODO change this as soon as you can !important
        true = Operand(d=True)
        begin = (self.begin_on.update(d) == true).d
        end = (self.end_on.update(d) == true).d
        r = self.update(d)
        if(begin and not end):
            if(self.phase == 'sleeping'):
                self.begin(d)
                self.phase = 'running'
            if(data.get('noTrade')):
                return None
            return r
        if(begin and end and self.phase == 'running'):
            self.end(d)
            self.phase = 'sleeping'
        return None

    def update(self, data):
        r = None
        if(self.operation):
            r = self.operation.update(data)
            if(r and r.d == True):
                # pass
                logger.info("{} {} - {} {}".format(datetime.fromtimestamp(int(data['time'])).strftime(
                    "%d-%m-%Y %H:%M"), data['token'], self.name, self.operation))
        return r
