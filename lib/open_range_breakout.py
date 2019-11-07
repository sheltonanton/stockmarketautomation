import schedule
import requests
import json
import time

from collections import defaultdict
from datetime import datetime, timedelta
from observer import Observer, Subject
from autotrade import Candles
from mapping import urls


BO_URL = urls['order_bo']
all_orders = []
max_order_count = 0
quantity = 1

class OpenRangeBreakout(Observer):
    '''
        Open Range breakout is the class to spit out the breakout on different timeframes registered for now, and in future will be tracking all timeframes until it is running
        TODO exception handling
        TODO identify the gapping and trade according to that
        TODO identify the open candle's bearishness and bullishness
    '''
    def __init__(self, tokens=[], stocks=[], timeframe=[1]):
        open_time = "09:15"
        self.tokens = tokens
        self.timeframe = timeframe
        self.calendar = defaultdict(list)
        self.phases = []
        tf = "%H:%M"

        start_time = datetime.strptime(open_time, tf)
        for t in self.timeframe:
            #start every timeframe at 9:13
            #call record at time 9:15
            #record for the subsequent time
            #end the process
            phase = Phase(stock_names=stocks, start_time=start_time, time_range=t, name="{}mins".format(t))
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
        tf = "%H:%M"
        data = dataFeed.data
        start = datetime.strptime("09:15",tf).time()
        end = datetime.strptime("15:20", tf).time()
        cur = datetime.fromtimestamp(int(data['t'])).time()
        if(cur >= start and cur <= end):
            data['t']
            for phase in self.phases:
                phase.update(data)

    def removed(self): #called when listener is removed
        print("Removing phases of open range breakout")
        for phase in self.phases:
            phase.removed()


class Phase:
    def __init__(self, stock_names=[], start_time=datetime.strptime("09:15", "%H:%M"), time_range=1, name='phase'):
        self.name = name
        self.phase = "start"
        self.stock_names = stock_names
        self.start_time = start_time
        self.time_range = time_range
        self.stocks = []
        self.token_to_stock_dict = {}
        self.noise_factor = 0  # TODO need to dynamically calculate noise factor
        for stock_name in self.stock_names:
            stock = {}
            stock['name'] = stock_name['name']
            stock['token'] = stock_name['token']
            self.token_to_stock_dict[stock['token']] = stock
            self.stocks.append(stock)
        self.orderMan = OrderMan(phase=self)

    def record(self):
        global all_orders
        all_orders = []
        for stock in self.stocks:
            stock['candle'] = Candles()
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

    def record_data(self, d):
        stock = self.token_to_stock_dict.get(int(d['token']))
        # print("Started Recording: {} {}",stock['name'], d['t'])
        if stock:
            stock['candle'].add_price(float(d['lastPrice']))

    def look_for_breakout(self, d):
        stock = self.token_to_stock_dict.get(int(d['token']))
        # print("Started Breakout: {} {}", stock['name'], d['t'])
        candle = stock and stock['candle'] #candle has open, high, low, close values
        if(candle is None):
            return
        price = float(d['lastPrice'])
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
                id = self.orderMan.post_order(otype, stock['name'], price, int(d['t']), quantity, "{}".format(self.name), len(all_orders) < max_order_count) #TODO quantity should be obtained with some calculations
                candle['id'] = id    

    def update(self, data):
        stock = self.token_to_stock_dict.get(int(data['token']))
        if not stock:
            return
        t = datetime.strptime(datetime.fromtimestamp(int(data['t'])).strftime("%H:%M"),"%H:%M")
        a = self.start_time
        b = self.start_time + timedelta(minutes=self.time_range*1)
        c = self.start_time + timedelta(minutes=self.time_range*2)
        if(t >= a and t < b):
            if(self.phase != "record"):
                self.phase == "record"
                self.record()
            self.record_data(data)
        elif(t >= b and t < c):
            if(self.phase != "breakout"):
                self.phase = "breakout"
                self.breakout()
            self.look_for_breakout(data)
        elif(t >= c and not self.is_end()):
            if(self.phase != "end"):
                self.phase = "end"
                self.end()
            self.orderMan.update(data)
            #TODO need to find out how to exit from orb completely

    def is_end(self):
        stocks = self.stocks
        for stock in stocks:
            if(stock.get('candle') is None): #if candle is none, means the recording phase is not even started
                return False
            if(type(stock.get('candle')) is dict): #check for all orders squared-off
                ended = stock['candle'].get('exit')
                if(not ended):
                    return False
        return True

    def removed(self):
        self.orderMan.exit()

#TODO later should be combined with the trader
class OrderMan:
    def __init__(self, phase):
        self.phase = phase

    def round_nearest(self, x, a):
	    return round(x/a)*a

    def update(self, d):
        stock = self.phase.token_to_stock_dict[int(d['token'])]
        price = float(d['lastPrice'])
        candle = stock['candle']
        stock['lastPrice'] = price
        stock['lastTime'] = int(d['t'])
        if(candle.get('exit') is None and candle.get('enter') is not None):
            enter = candle['enter']
            t = (price - enter, enter - price)[candle['dir'] == 'down']
            stop_loss = stock.get('stop_loss') or self.round_nearest(-enter*0.004,0.05)
            target = stock.get('target') or self.round_nearest(enter*0.008,0.05)
            if(t >= target or t <= stop_loss or datetime.fromtimestamp(int(d['t'])).time() >= datetime.strptime("15:25","%H:%M").time()):
                candle['exit'] = price
                self.put_order(candle, {'exitPrice': price, 'exitTime': int(d['t'])})

    def post_order(self, otype, stock, entryPrice, entryTime, quantity, comments, original):
        jsonData = {
            'type': otype,
            'stock': stock,
            'price': entryPrice,
            'entryTime': entryTime,
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
            lastTime = stock['lastTime']
            if(stock['candle'].get('enter') is not None):
                stock['candle']['exit'] = lastPrice
                self.put_order(stock['candle'], {'exitPrice': lastPrice, 'exitTime': lastTime})

#TODO add the noise factor
#TODO trade at cumulative time frame upto 6 minutes
#TODO take order for a defined quantity only
#TODO create an original zerodha order with 1 quantity for now
#TODO simulate the trade with dummy data
#TODO blocking repeated same stock trade
