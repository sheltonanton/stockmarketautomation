import json
from operands import Operand, Operation, create_operation
from threading import Thread
import queue
from trader import create_trader, lt
from collections import defaultdict
from datetime import datetime, timedelta
from observer import Observer
from data_feed import DataFeed
import pdb

import logging

logger = logging.getLogger('flowLogger')

# execute the trade based on strategy indication and exit from the trade on counter, target or stoploss
class TradeManager(Observer):
    '''
        Regulates and manages the trade on different platforms and types
    '''
    #TODO check for simulation or not before executing orders and execute it accordingly

    def __init__(self, inputPipe=None, config={}, simulation=False):
        self.traders = []
        self.config = config
        self.input = inputPipe
        self.simulation = simulation
        self.zero = Operand(d=0)
        self.one = Operand(d=1)
        self.initialize()

    def initialize(self):
        self.strategies = defaultdict(list)
        self.counters = defaultdict(list)
        self.flag = True

    def load_trades(self, trades):
        self.initialize()
        if(type(trades) is dict):
            for k in trades:
                for t in trades[k]:
                    self.strategies[k].append(self.create_trade(t))
        if(type(trades) is list):
            for t in trades:
                for s in t.get('strategies'):
                    self.strategies[t[s]].append(self.create_trade(t))

    def update_order(self, order):
        for key in self.strategies:
            trader = self.strategies[key]['trader']
            trader.update_order(order)

    def update(self, dataFeed:DataFeed):
        try:
            while(True):
                data = self.input.get_nowait()
                if(data):
                    logger.info("Popped from queue: {} - {} {}".format(lt(data['data']['time']), data['name'], json.dumps(data)))
                    self.close_counter_trades(strategy=data)
                    for trade in self.strategies[data['_id']+"_"+data['token']]:
                            if(data.get('status') == 'on'):
                                self.close_trades(stock=data['token'], order_type=('sell' if data['type'] == 'buy' else 'sell'))
                                price = trade['price']
                                target = trade['target']
                                stoploss = trade['stoploss']
                                quantity = trade['quantity']
                                s = d = None
                                s = data['stock']
                                d = {**data, **data['data']}
                                price = (price, price.update(d).d)[
                                    type(price) is Operation or type(price) is Operand]
                                target = (target, target.update(d).d)[
                                    type(target) is Operation or type(target) is Operand]
                                stoploss = (stoploss, stoploss.update(d).d)[
                                    type(stoploss) is Operation or type(stoploss) is Operand]
                                quantity = (quantity, quantity.update(d).d)[
                                    type(quantity) is Operation or type(quantity) is Operand]
                                if(quantity == 0):
                                        quantity = 1
                                r = None
                                if(target == 0):
                                    #TODO generalize counter
                                    r = trade['trader'].trade(stock=s, otype=data.get(
                                        'type') or 'buy', price=price, stoploss=stoploss, quantity=quantity, params=d)
                                else:
                                    r = trade['trader'].trade(s, data.get(
                                        'type') or 'buy', price, target, stoploss, quantity, params=d)
                                if r:
                                    self.counters[data['counter']+"_"+data['token']].append({
                                        'trader': trade['trader'],
                                        'args': [r['variety'], r['order_id']]
                                    })
        except queue.Empty:
            pass

        data = dataFeed.data
        for key in self.strategies:
            for strategy in self.strategies[key]:
                trader = strategy['trader']
                trader.update(data)

    def create_trade(self, trade=None):
        price = self.get_operation(trade.get('price'))
        target = self.get_operation(trade.get('target'))
        stoploss = self.get_operation(trade.get('stoploss'))
        quantity = self.get_operation(trade.get('quantity'))
        trader = create_trader(trade['trader'], {})

        trade = {
            'price': price,
            'target': target,
            'stoploss': stoploss,
            'quantity': quantity,
            'trader': trader
        }
        return trade

    def get_operation(self, arg):
        if(type(arg) is str):
            #it is an operation
            operation = create_operation(data=json.loads(arg))
            return operation
        elif(type(arg) is float or type(arg) is int):
            #return the integer or float as it is
            return Operand(d=arg)
        elif(type(arg) is list):
            return Operand(d=0)
        elif(arg is None):
            #return 0
            return Operand(d=0)

    def perform_pre_operations(self, strategy = None, trade = None):
        self.close_counter_trades(strategy=strategy, trade=trade)
        self.close_trades(stock=(strategy and strategy['token']), order_type = strategy['type'])

    def close_trades(self, stock, order_type):
        for key in self.strategies:
            if key and key.find(stock):
                for trade in self.strategies[key]:
                    trade['trader'].close_all_trades(order_type)

    def close_counter_trades(self, strategy = None, trade = None):
        counters = self.counters[strategy['_id']+"_"+strategy['token']]
        for counter in counters:
            status = counter['trader'].close_counter_trades([*counter['args'], strategy.get('data')])
            if status:
                counters.remove(counter)

    def stop(self):
        self.flag = False
        for key in self.strategies:
            for strategy in self.strategies[key]:
                trader = strategy['trader']
                trader.close_all_trades('buy')
                trader.close_all_trades('sell')

    def get_report(self):
        final_report = []
        for key in self.strategies:
            for trade in self.strategies[key]:
                trader = trade['trader']
                report = trader.get_report()
                final_report.append({
                    "strategy": key,
                    'trades': report
                })
        return final_report

class DateManager:
    ''' Regulates and manages date related operations through this class '''
    def __init__(self):
        pass

    def time(self, days=None, string_format=None):
        days = days or 0
        now = datetime.now()
        now = now + timedelta(days)
        return_value = now
        if(string_format):
            return_value = now.strftime(string_format)
        return return_value
