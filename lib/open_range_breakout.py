import schedule
import requests
import json
import time

from collections import defaultdict
from datetime import datetime, timedelta
from observer import Observer, Subject
from autotrade import Candles
from urls import urls


BO_URL = urls['order_bo']
all_orders = []
max_order_count = 3
quantity = 1

class OpenRangeBreakout(Observer):
    '''
        Open Range breakout is the class to spit out the breakout on different timeframes registered for now, and in future will be tracking all timeframes until it is running
        TODO exception handling
        TODO identify the gapping and trade according to that
        TODO identify the open candle's bearishness and bullishness
    '''
    def __init__(self, tokens=[], stocks=[]):
        self.tokens = tokens
        self.timeframe = [1,2,3,4,5,6]
        self.calendar = defaultdict(list)
        self.phases = []
        tf = "%H:%M"

        start_time = datetime.strptime("09:15",tf)
        for t in self.timeframe:
            #start every timeframe at 9:13
            #call record at time 9:15
            #record for the subsequent time
            #end the process
            phase = Phase(stock_names=stocks, name="{}mins".format(t))
            self.phases.append(phase)
            breakout_time = (start_time + timedelta(minutes=t)).strftime(tf)
            end_time = (start_time + timedelta(minutes=2*t)).strftime(tf)
            record_time = start_time.strftime(tf)
            
            self.calendar[record_time].append(phase.record)
            self.calendar[breakout_time].append(phase.breakout)
            self.calendar[end_time].append(phase.end)

        for t in self.calendar:
            for callback in self.calendar[t]:
                schedule.every().day.at(t).do(callback)

    def update(self, dataFeed: Subject):  # passing the data is done through this data pipe
        data = dataFeed.data
        for phase in self.phases:
            phase.update(data)

    def start(self):
        while True:
            schedule.run_pending()
            time.sleep(1)

    def removed(self): #called when listener is removed
        for phase in self.phases:
            phase.removed()


class Phase:
    def __init__(self, stock_names=[], name='phase'):
        self.name = name
        self.phase = "start"
        self.stock_names = stock_names
        self.stocks = []
        self.token_to_stock_dict = {}
        self.noise_factor = 0.3 #TODO need to dynamically calculate noise factor
        for stock_name in self.stock_names:
            stock = {}
            stock['name'] = stock_name['name']
            stock['token'] = stock_name['token']
            stock['candle'] = Candles()
            self.token_to_stock_dict[stock['token']] = stock
            self.stocks.append(stock)
        self.orderMan = OrderMan(phase=self)

    def record(self):
        print("{} Recording".format(self.name))
        self.phase = "record"

    def breakout(self):
        print("{} Breakout Trading".format(self.name))
        for stock in self.stocks:
            candleManager:Candles = stock['candle']
            candle = None
            try:
                candle = candleManager.save_prev_candle()
            except ValueError as error:
                print(error)
            stock['candle'] = candle
        self.phase = "breakout"

    def end(self):
        print("{} End Trading".format(self.name))
        self.phase = "end"

    def record_data(self, data):
        for d in data:
            stock = self.token_to_stock_dict[d['token']]
            stock['candle'].add_price(d['lastPrice'])

    def look_for_breakout(self, data):
        for d in data:
            stock = self.token_to_stock_dict[d['token']]
            candle = stock['candle'] #candle has open, high, low, close values
            if(candle is None):
                return
            price = d['lastPrice']
            #track the breakouts for the timeframe
            #indentify the breakout in up or down direction
            if(candle.get('enter') is None):
                otype = None
                if(price > (candle['high'] + self.noise_factor)):
                    candle['dir'] = 'up'
                    otype = "BUY"
                if(price < (candle['low'] - self.noise_factor)):
                    candle['dir'] = 'down'
                    otype = "SELL"
                    
                if(otype is not None):
                    candle['enter'] = price
                    id = self.orderMan.post_order(otype, stock['name'], price, quantity, "{}".format(self.name), len(all_orders) <= max_order_count) #TODO quantity should be obtained with some calculations
                    candle['id'] = id    

    def update(self, data):
        if(self.phase == "record"):
            self.record_data(data)
        if(self.phase == "breakout"):
            self.look_for_breakout(data)
        if(self.phase == "breakout" or self.phase == "end"):
            self.orderMan.update(data)

    def removed(self):
        self.orderMan.exit()

#TODO later should be combined with the trader
class OrderMan:
    def __init__(self, phase):
        self.phase = phase

    def update(self, data):
        for d in data:
            stock = self.phase.token_to_stock_dict[d['token']]
            price = d['lastPrice']
            candle = stock['candle']
            stock['lastPrice'] = price
            if(candle.get('exit') is None and candle.get('enter') is not None):
                enter = candle['enter']
                t = (price - enter, enter - price)[candle['dir'] == 'down']
                stop_loss = stock.get('stop_loss') or -1.0
                target = stock.get('target') or 0.7
                if(t >= target or t <= stop_loss):
                    candle['exit'] = price
                    self.put_order(candle, {'exitPrice': price, 'exitTime': round(time.time() * 1000)})

    def post_order(self, otype, stock, entryPrice, quantity, comments, original):
        jsonData = {
            'type': otype,
            'stock': stock,
            'entryPrice': entryPrice,
            'entryTime': round(time.time() * 1000),
            'quantity': quantity,
            'comments': comments,
            'original': original
        }
        for order in all_orders:
            if(order['stock'] == stock):
                return
        all_orders.append(jsonData)
        print("Executing Order: {}".format(json.dumps(jsonData)))
        r = requests.post(BO_URL, json={'bo':jsonData})
        #TODO this shouldn't be how to track order
        r = json.loads(r.content.decode('utf-8'))['data']
        return r["_id"]

    def put_order(self, candle, data):
        data['_id'] = candle['id']
        requests.put(BO_URL, json={'bo': data})

    def exit(self):
        for stock in self.phase.stocks:
            lastPrice = stock['lastPrice']
            if(stock['candle'].get('enter') is not None):
                stock['candle']['exit'] = lastPrice
                self.put_order(stock['candle'], {'exitPrice': lastPrice, 'exitTime': round(time.time() * 1000)})

#TODO add the noise factor
#TODO trade at cumulative time frame upto 6 minutes
#TODO take order for a defined quantity only
#TODO create an original zerodha order with 1 quantity for now
#TODO simulate the trade with dummy data
#TODO blocking repeated same stock trade
