import requests
import json
from mapping import urls, traders
import pdb

class Trader:
    '''
        Trader is the abstract class for allowing operations such as taking, tracking and exiting from
        orders;
        Trader should be initialized with loaded funds or should be modified dynamically within the limit
    '''

    def __init__(self, name, config={}):
        self.name = name
        self.orders = {}
        self.net = 0
        self.fund = 0
        self.config = config

    def configure(self, config, config_fn=lambda x: x):
        '''
            Used to configure the trader with the pre-requesites
        '''
        return

    def trade_bo(self, stock, otype, price, target, stoploss, quantity):
        '''Trade will be taken based on the above parameters
            returns order
        '''
        return

    def trade_co(self, stock, otype, price, stoploss, quantity, params):
        '''
            Trade will be taken based on above parameters in co type
        '''

    def trade_limit(self, stock, otype, price, quantity, params):
        '''Limit trade with no stoploss and traget
            returns order
        '''
        return

    def trade_exit(self, order=None, orderId=None):
        '''Exit the trade for the particular order or orderId'''
        if(orderId):
            order = self.orders.get(orderId)
        if(order):
            print(order)

    def trade(self, stock, otype, price, target, stoploss, quantity, params):
        '''Entry point of trade and take trade according to the specified variety'''
        #TODO save the order

    def get_orders(self):
        return

    def close_all_trades(self, stock):
        return

    def close_counter_trades(self, args):
        return

    def set_fund(self, fund):
        self.fund = fund

    def get_fund(self):
        return self.fund

    def add_fund(self, fund):
        self.fund = self.fund + fund
        return self.fund

    def get_net(self):
        return self.net

    def update_order(self, order):
        pass

def create_trader(name, config):
    return globals()[traders[name]](name, config)


BO_URL = urls['order_bo']
REGULAR_URL = urls['order_regular']
CO_URL = urls['order_co']

class ZerodhaTrader(Trader):
    ''' TODO track pending, cancelled, executed and rejected orders '''

    def __init__(self, name, config={}):
        Trader.__init__(self, name, config)

    def configure(self, config, config_fn=None):
        Trader.configure(self, config, config_fn)

    def trade_bo(self, stock, otype, price, target, stoploss, quantity, params):
        order = {
            'stock': stock,
            'type': otype,
            'quantity': quantity,
            'price': price,
            'target': target,
            'stoploss': stoploss,
            'original': True
        }
        #TODO initially cancel all orders first if any exists
        r = requests.post(BO_URL, json={'bo': order})
        r = json.loads(r.content)
        if(r.get('status') == 'success'):
            # should check with zerodha for order executed
            order['executed'] = True
            order['id'] = r['_id']
            self.orders[r['_id']] = order
            self.fund = self.fund - price
        else:
            order['executed'] = False

        return r['_id']

    def trade_limit(self, stock, otype, price, quantity, params):
        order = {
            'stock': stock,
            'price': price,
            'type': otype,
            'qunatity': quantity,
            'original': True
        }
        r = requests.post(REGULAR_URL, json={'regular': order})
        r = json.loads(r.content)
        if(r.get('status') == 'success'):
            # should check with zerodha for order execution
            d = r.get('data')
            order['executed'] = True
            order['id'] = d.get('_id')
            self.orders[d['_id']] = order
            self.fund = self.fund - price
            return d['_id']
        return None

    def trade_co(self, stock, otype, price, stoploss, quantity, params):
        order = {
            'stock': stock,
            'price': price,
            'type': otype,
            'trigger_price': (float(params.get('lastPrice')) - float(stoploss), float(params.get('lastPrice')) + float(stoploss))[otype == 'sell'],
            'quantity': quantity,
            'original': True
        }
        r = requests.post(CO_URL, json={'co': order})
        r = json.loads(r.content)
        if(r.get('status') == 'success'):
            d = r.get('data')
            order['executed'] = True
            order['id'] = d.get('_id')
            self.orders[d['_id']] = order
            self.fund = self.fund - price
            return d.get("_id")
        return None

    def trade_exit(self, order=None, orderId=None):
        if(orderId):
            order = self.orders.get(orderId)
        if(order):
            #send exit request
            #TODO TODO TODO delete order
            url = "{}/{}?order_id={}&variety=bo".format(
                BO_URL, order.get('id'), order.get('id'))
            r = requests.delete(url)
            j = json.loads(r.content)
            return j['status']
        return False

    def trade(self, stock=None, otype=None, price=0, target=0, stoploss=0, quantity=1, params={}):
        Trader.trade(self, stock, otype, price, target,
                     stoploss, quantity, params)
        if(target is 0 and stoploss is not 0):
            return self.trade_co(stock, otype, price, stoploss, quantity, params)
        if(target is not 0 and stoploss is not 0):
            return self.trade_bo(stock, otype, price, target,
                          stoploss, quantity, params)
        if(target is 0 and stoploss is 0):
            return self.trade_limit(stock, otype, price, quantity, params)

    def add_fund(self, fund):
        self.fund = self.fund + fund
        return self.fund

    def get_fund(self):
        return self.fund

    def set_fund(self, fund):
        self.fund = fund

    def close_all_trades(self, stock):
        #Need to write an implementation
        pass

    def close_counter_trades(self, args):
        pass
        #arg[0] order_id
        #Need to close all the counter trades for a particular stock

    def update_order(self, order):
        pass
