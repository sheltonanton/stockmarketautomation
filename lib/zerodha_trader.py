from autotrade import Trader
import requests
from urls import urls
import json

BO_URL = urls['order_bo']
REGULAR_URL = urls['order_regular']

class ZerodhaTrader(Trader):

    def __init__(self, name, config={}):
        Trader.__init__(self, name, config)

    def configure(self, config, config_fn=None):
        Trader.configure(self, config, config_fn)

    def trade_bo(self, stock, price, otype, target, stoploss, quantity):
        order = {
            'stock': stock,
            'type': otype,
            'quantity': quantity,
            'price': price,
            'target': target,
            'stoploss': stoploss
        }
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
            
        return r.get('status')

    def trade_limit(self, stock, price, otype, quantity):
        order = {
            'stock': stock,
            'price': price,
            'type': otype,
            'qunatity': quantity
        }
        r = requests.post(REGULAR_URL, json={'regular': order})
        r = json.loads(r.content)
        if(r.get('status') == 'success'):
            order['executed'] = True #should check with zerodha for order execution
            order['id'] = r.get('_id')
            self.orders[r['_id']] = order
            self.fund = self.fund - price

    def trade_exit(self, order=None, orderId=None):
        if(orderId):
            order = self.orders.get(orderId)
        if(order):
            #send exit request
            #TODO TODO TODO delete order
            url = "{}/{}?order_id={}&variety=bo".format(BO_URL, order.get('id'),order.get('id'))
            r = requests.delete(url)
            j = json.loads(r.content)
            return j['status']
        return False

    def add_fund(self, fund):
        self.fund = self.fund + fund
        return self.fund

    def get_fund(self):
        return self.fund

    def set_fund(self, fund):
        self.fund = fund
