import json
from operands import Operand, Operation, create_operation
from threading import Thread
from trader import create_trader
from collections import defaultdict
from datetime import datetime
import pdb

class TradeManager:
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
        self.flag = False

    def start(self):
        self.flag = True
        self.thread = Thread(target=self.run, args=())
        self.thread.start()

    def run(self):
        while(self.flag):
            data = self.input.recv()
            self.perform_pre_operations(strategy=data)
            for trade in self.strategies[data['_id']]:
                print(datetime.fromtimestamp(int(data['data']['t'])).strftime("%H:%M:%S"))
                if(data['status'] == 'on'):
                    price = trade['price']
                    target = trade['target']
                    stoploss = trade['stoploss']
                    quantity = trade['quantity']
                    s = d = None
                    s = data['stock']
                    d = {**data, **data['data']}
                    price = (price, price.update(d).d)[type(price) is Operation or type(price) is Operand]
                    target = (target, target.update(d).d)[type(target) is Operation or type(target) is Operand]
                    stoploss = (stoploss, stoploss.update(d).d)[type(stoploss) is Operation or type(stoploss) is Operand]
                    quantity = (quantity, quantity.update(d).d)[type(quantity) is Operation or type(quantity) is Operand]
                    if(quantity == 0):
                            quantity = 1
                    if(target == 0):
                        #TODO generalize counter
                        r = trade['trader'].trade(stock=s, otype=data.get('type') or 'buy', price=price, stoploss=stoploss, quantity=quantity, params=d)
                        if r:
                            self.counters[data['counter']].append({
                                'trader': trade['trader'],
                                'args': [r['variety'], r['order_id']]
                            })
                    else:
                        trade['trader'].trade(s, data.get('type') or 'buy', price, target, stoploss, quantity, params=d)

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

    def update(self, data):
        for key in self.strategies:
            trader = self.strategies[key]['trader']
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

    def perform_pre_operations(self, strategy=None, trade=None):
        self.close_counter_trades(strategy=strategy, trade=trade)
        self.close_trades(strategy=strategy, trade=trade)

    def close_trades(self, strategy=None, trade=None):
        pass

    def close_counter_trades(self, strategy=None, trade=None):
        counters = self.counters[strategy['_id']]
        for counter in counters:
            status = counter['trader'].close_counter_trades([*counter['args'], strategy.get('data')])
            if status:
                counters.remove(counter)

    def stop(self):
        self.flag = False
