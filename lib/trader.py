import requests
import json
from mapping import urls, traders
import datetime
from observer import Observer
import pdb
import logging
import uuid

bt_logger = logging.getLogger('backtestLogger')
lt_logger = logging.getLogger('livetradeLogger')

def lt(time):
    if(time):
        time = int(time)
        return datetime.datetime.fromtimestamp(time).strftime("%d-%m-%Y %H:%M")
    return 'NONE'

def add_log(order, log):
    if(order.get('log')):
        order['log'] = order['log'] + '\n' + log
    else:
        order['log'] = '\n' + log
    return log

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
            config (dict)
            config_fn (function which returns config dict)
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

    def update(self, data):
        pass

    def get_orders(self):
        return

    def close_all_trades(self, order_type):
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

    def get_report(self):
        return "REPORT"

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
            'original': not params.get('sm'),
            'entryPrice': params.get('lastPrice'),
            'entryTime': int(params.get('time')),
            'strategy': params.get('name'),
            'trades': list(map(lambda x: x['name'], params.get('trades')))
        }
        #TODO initially cancel all orders first if any exists
        r = requests.post(BO_URL, json={'bo': order})
        r = json.loads(r.content)
        if(r.get('status') == 'success'):
            # should check with zerodha for order executed
            d = r.get('data')
            order['executed'] = True
            order['id'] = d['_id']
            order['variety'] = 'bo'
            order['token'] = params.get('token')
            self.orders[d['_id']] = order
            self.fund = self.fund - price
            lt_logger.info(add_log(order, "TRADE BO\t: order_id: {} - [{}]".format(order['id'], lt(params.get('time')))))
            return {
                'variety': 'bo',
                'order_id': d.get('_id')
            }
        return None

    def trade_limit(self, stock, otype, price, quantity, params):
        order = {
            'stock': stock,
            'price': price,
            'type': otype,
            'qunatity': quantity,
            'original': not params.get('sm'),
            'strategy': params.get('name'),
            'trades': list(map(lambda x: x['name'], params.get('trades')))
        }
        r = requests.post(REGULAR_URL, json={'regular': order})
        r = json.loads(r.content)
        if(r.get('status') == 'success'):
            # should check with zerodha for order execution
            d = r.get('data')
            order['executed'] = True
            order['id'] = d.get('_id')
            order['variety'] = 'limit'
            order['token'] = params.get('token')
            self.orders[d['_id']] = order
            order['token'] = params.get('token')
            lt_logger.info(add_log(order, "TRADE LIMIT\t: order_id: {} - [{}]".format(order['id'], lt(params.get('time')))))
            return d['_id']
        return None

    def trade_co(self, stock, otype, price, stoploss, quantity, params):
        order = {
            'stock': stock,
            'price': price,
            'type': otype,
            'trigger_price': (float(params.get('lastPrice')) - float(stoploss), float(params.get('lastPrice')) + float(stoploss))[otype == 'sell'],
            'quantity': quantity,
            'original': not params.get('sm'),
            'entryPrice': params.get('lastPrice'),
            'entryTime': int(params.get('time')),
            'strategy': params.get('name'),
            'trades': list(map(lambda x: x['name'], params.get('trades')))
        }
        r = requests.post(CO_URL, json={'co': order})
        r = json.loads(r.content)
        if(r.get('status') == 'success'):
            d = r.get('data')
            order['executed'] = True
            order['id'] = d.get('_id')
            order['variety'] = 'co'
            order['token'] = params.get('token')
            self.orders[d['_id']] = order
            self.fund = self.fund - price
            lt_logger.info(add_log(order, "TRADE CO\t: order_id: {} - [{}]".format(order['id'], lt(params.get('time')))))
            return {
                'variety': 'co',
                'order_id': d.get("_id")
            }
        return None

    def update(self, data):
        for key,order in self.orders.items():
            if(int(order['token']) == int(data['token'])):
                order['lastData'] = data

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

    def close_all_trades(self, order_type):
        try:
            for key,order in self.orders.items():
                if(order_type == order['type']):
                    params = {
                        'variety': order['variety'],
                        'order_id': order['id'],
                        'original': order['original']
                    }
                    r = requests.delete(urls['order_{}'.format(order['variety'])], json=params)
                    order['exitPrice'] = order.get('lastData').get('price')
                    order['exitTime'] = order.get('lastData').get('time')
            return True
        except:
            return False

    def close_counter_trades(self, args):
        params = {
            'variety': args[0],
            'order_id': args[1],
            'original': not args[2].get('sm')
        }
        r = requests.delete(urls['order_{}'.format(args[0])], json=params)
        return args[1]

    def update_order(self, order):
        pass

class SimulatedTrader(Trader, Observer):
    '''
        order = {
            target: float,
            stoploss: float,
            entryPrice: float,
            entryTime: int,
            exitPrice: float,
            exitTime: int,
            status: string (pending, squareoff, executed)
        }
    '''
    def __init__(self, name, config={}):
        Trader.__init__(self, name, config)
        self.order_count = 0
        self.PENDING = 'pending'
        self.SQUAREOFF = 'squareoff'
        self.EXECUTED = 'executed'
        self.EXITED = 'exited'
        self.CANCELLED = 'cancelled'
        self.BUY = 'buy'
        self.SELL = 'sell'
        self.orders = {}

    def configure(self, config, config_fn=None):
        Trader.configure(self, config, config_fn=config_fn)

    def trade_bo(self, stock, otype, price, target, stoploss, quantity, params):
        order = {
            'stock': stock,
            'type': otype,
            'quantity': quantity,
            'price': price,
            'target': target,
            'stoploss': stoploss,
            'original': False,
            'entryPrice': params.get('lastPrice'),
            'entryTime': int(params.get('time')),
            'strategy': params.get("name"),
            'trades': list(map(lambda x: x['name'], params.get('trades'))),
            'status': self.PENDING
        }
        #TODO TODO important for tracking orders
        stock_orders = self.orders.setdefault(int(params.get('token')), {})      
        order_id = str(uuid.uuid1())      
        stock_orders[order_id] = order
        bt_logger.info(add_log(order, "TRADE BO\t: order_id: {} - [{}]".format(order_id, lt(params.get('time')))))
        return {
            'variety': 'bo',
            'order_id': order_id
        }

    def trade_limit(self, stock, otype, price, quantity, params):
        order = {
            'stock': stock,
            'price': price,
            'type': otype,
            'qunatity': quantity,
            'original': not params.get('sm'),
            'strategy': params.get('name'),
            'trades': list(map(lambda x: x['name'], params.get('trades'))),
            'status': self.PENDING
        }
        stock_orders = self.orders.setdefault(int(params.get('token')), {})
        order_id = str(uuid.uuid1())
        stock_orders[order_id] = order
        bt_logger.info(add_log(order,"TRADE LIMIT\t: order_id: {} - [{}]".format(order_id, lt(params.get('time')))))
        return {
            'variety': 'limit',
            'order_id': order_id
        }

    def trade_co(self, stock, otype, price, stoploss, quantity, params):
        order = {
            'stock': stock,
            'price': price,
            'type': otype,
            'trigger_price': (float(params.get('lastPrice')) - float(stoploss), float(params.get('lastPrice')) + float(stoploss))[otype == 'sell'],
            'quantity': quantity,
            'original': not params.get('sm'),
            'entryPrice': params.get('lastPrice'),
            'entryTime': int(params.get('time')),
            'strategy': params.get('name'),
            'trades': list(map(lambda x: x['name'], params.get('trades'))),
            'status': self.PENDING
        }
        stock_orders = self.orders.setdefault(int(params.get('token')), {})
        order_id = str(uuid.uuid1())
        stock_orders[order_id] = order
        bt_logger.info(add_log(order,"TRADE CO\t: order_id: {} - [{}]".format(order_id, lt(params.get('time')))))
        return {
            'variety': 'co',
            'order_id': order_id
        }

    def trade(self, stock=None, otype=None, price=0, target=0, stoploss=0, quantity=1, params={}):
        Trader.trade(self, stock, otype, price, target,
                     stoploss, quantity, params)
        if(target is 0 and stoploss is not 0):
            return self.trade_co(stock, otype, price, stoploss, quantity, params)
        if(target is not 0 and stoploss is not 0):
            return self.trade_bo(stock, otype, price, target, stoploss, quantity, params)
        if(target is 0 and stoploss is 0):
            return self.trade_limit(stock, otype, price, quantity, params)

    def trade_exit(self, order=None, orderId=None):
        if(order):
            order['status'] = self.EXITED
            return order
        return False

    def add_fund(self, fund):
        self.fund = self.fund + fund
        return self.fund

    def get_fund(self):
        return self.fund

    def set_fund(self, fund):
        self.fund = fund

    def close_all_trades(self, order_type):
        #Need to write an implementation
        for token in self.orders:
            bt_logger.info("Closing all trades: {}".format(token))
            orders = self.orders.get(token) or []
            for order_id in orders:
                order = orders[order_id]
                status = order.get('status')
                if(order['type'] == order_type):
                    try:
                        if(status and status == self.SQUAREOFF):
                            order['status'] = self.EXITED
                            order['exitPrice'] = order.get('lastData').get('close')
                            order['exitTime'] = order.get('lastData').get('time')
                            bt_logger.info(add_log(order,"Closed trade: {} - {} on [{} - {}]".format(order_id, order['stock'], lt(order['entryTime']), lt(order['exitTime']))))
                        elif(status and status == self.PENDING):
                            order['status'] = self.CANCELLED
                            order['exitPrice'] = order.get('lastData').get('close')
                            order['exitTime'] = order.get('lastData').get('time')
                            bt_logger.info(add_log(order,"Cancelled trade: {} - {} on [{} - {}]".format(order_id, order['stock'], lt(order['entryTime']), lt(order['exitTime']))))
                            if(not order['exitTime']):
                                bt_logger.error("ExitTime is NONE")
                                bt_logger.error(order.get('log') or 'NONE')

                    except Exception as e:
                        bt_logger.error("Exception occurred")
                        bt_logger.error(e)
                    order.pop('log', None)
                    order.pop('lastData', None)

    def close_counter_trades(self, args):
        data = args[2]
        orders = self.orders.get(int(data.get("token"))) or {}
        order = orders.get(args[1])
        if(order):
            if(order.get('status') == self.SQUAREOFF):
                order.update({
                    'status': self.EXECUTED,
                    'exitPrice': data.get('lastPrice'),
                    'exitTime': data.get('time')
                })
                bt_logger.info(add_log(order, "Closed by counter strategy trade: {} - {} on [{} - {}]".format(args[1], order['stock'], lt(order['entryTime']), lt(order['exitTime']))))
            if(order.get('status') == self.PENDING):
                order.update({
                    'status': self.CANCELLED,
                    'exitPrice': data.get('lastPrice'),
                    'exitTime': data.get('time')
                })
                bt_logger.info(add_log(order, "Cancelled by counter strategy trade: {} - {} on [{} - {}]".format(args[1], order['stock'], lt(order['entryTime']), lt(order['exitTime']))))
        return args[1]

    def update(self, data):
        self.trackOrders(data)

    def trackOrders(self, data):
        #TODO exit all trades at the end of intraday
        orders = self.orders.get(int(data.get('token'))) or {}
        for order_id in orders:
            order = orders[order_id]
            try:
                price = order.get('entryPrice')
                status = order.get('status')

                if(status and status == self.PENDING):
                    ### ------------------- FOR PENDING ORDERS  ---------------------------------- ###
                    if(datetime.datetime.fromtimestamp(int(data.get("time"))).time() <= datetime.time(hour=9, minute=15)):
                        # ------     1. Exiting the trade   ----------- #
                        order.update({
                            'status': self.CANCELLED,
                            'exitPrice': order.setdefault('lastData', {}).get('close'),
                            'exitTime': order.setdefault('lastData', {}).get('time'),
                        })
                        bt_logger.info(add_log(order, "Cancelled trade: {} - {} on [{} - {}]".format(order_id, order['stock'], lt(order['entryTime']), lt(order['exitTime']))))
                        if(not order['exitTime']):
                            bt_logger.error("ExitTime is NONE")
                            bt_logger.error(order.get('log') or 'NONE')

                    elif(price and self.hasPriceCrossed(price, data, order.get('type'))):
                        # ------     2. Entering on the limit price     ----------------- #
                        order['status'] = self.SQUAREOFF
                        bt_logger.info(add_log(order,"Entered trade: {} - {} on [{}]".format(order_id, order['stock'], lt(order['entryTime']))))
                        # continue - commented so that squareoff could be done on the same price

                elif(status and status == self.SQUAREOFF):
                    ### ------------------- FOR ONGOING ORDERS  ---------------------------------- ###
                    stoploss = order.get('stoploss') and (price + order.get('stoploss'), price - order.get('stoploss'))[order.get('type') == self.BUY]
                    stoploss = stoploss or (order.get('triggerPrice') and float(order.get('triggerPrice')))
                    target = order.get('target') and (price + order.get('target'), price - order.get('target'))[order.get('type') == self.SELL]

                    if(datetime.datetime.fromtimestamp(int(data.get("time"))).time() <= datetime.time(hour=9, minute=15)):
                        # ------     1. Exiting the trade   ----------- #
                        order.update({
                            'status': self.EXITED,
                            'exitPrice': order.setdefault('lastData', {}).get('close'),
                            'exitTime': order.setdefault('lastData', {}).get('time'),
                        })
                        bt_logger.info(add_log(order,"Closed trade: {} - {} on [{} - {}]".format(order_id, order['stock'], lt(order['entryTime']), lt(order['exitTime']))))

                    elif(stoploss and self.hasPriceCrossed(stoploss, data, self.get_other_type(order.get('type')))):
                        #   -------------   4. STOPLOSS EXECUTED   ------------------------ #
                        order.update({
                            'status': self.EXECUTED,
                            'exitPrice': stoploss,
                            'exitTime': data.get('time')
                        })
                        bt_logger.info(add_log(order,"Executed trade: {} - {} on [{} - {}]".format(order_id, order['stock'], lt(order['entryTime']), lt(order['exitTime']))))
                        #TODO update the exit time in database
                        #TODO update the exit price in database

                    elif(target and self.hasPriceCrossed(target, data, order.get('type'))):
                        #   -------------   3. TARGET EXECUTED     ------------------------ #
                        order.update({
                            'status': self.EXECUTED,
                            'exitPrice': target,
                            'exitTime': data.get('time')
                        })
                        bt_logger.info(add_log(order,"Executed trade: {} - {} on [{} - {}]".format(order_id, order['stock'], lt(order['entryTime']), lt(order['exitTime']))))
                        #TODO update the exit time in database
                        #TODO update the exit price in database
            except RuntimeError as r:
                bt_logger.error('\n' + r)
            if(not order.get('lastData')):
                add_log(order, 'lastData updated: '+str(data))
            order['lastData'] = data

    def hasPriceCrossed(self, value, candle, otype):
        value = float(value)
        if(otype == self.BUY):
            return (value <= float(candle['high']))
        elif(otype == self.SELL):
            return (value >= float(candle['low']))

    def get_report(self):
        report = []
        for token in self.orders:
            orders = self.orders[token]
            for order_id in orders:
                order = orders[order_id]
                order['id'] = order_id
                order['token'] = token
                order['entryTime'] = datetime.datetime.fromtimestamp(int(order['entryTime'])).strftime("%d-%m-%Y %H:%M") if order['entryTime'] else None
                order['exitTime'] = datetime.datetime.fromtimestamp(int(order['exitTime'])).strftime("%d-%m-%Y %H:%M") if order['exitTime'] else None
                report.append(order)
        return report

    def get_other_type(self, otype):
        if(otype == self.BUY):
            return self.SELL
        else:
            return self.BUY
