import json
import time
from pathlib import Path
from datetime import datetime,timedelta
from threading import Thread
from datetime import datetime
import pdb
import requests
from mapping import urls
import logging
from kiteconnect import KiteTicker
from multiprocessing import Queue, Process
from observer import Subject, Observer

no_save = None

class DataFeed(Subject):
    def __init__(self, save=False, filepath="."):
        Subject.__init__(self)
        self.filepath = filepath
        self.last_time = 0
        self.simulations = []
        if(save):
            self.saver = DataSaver(filepath)
            self.attach(self.saver, simulation=False)

    def notify(self, data):
        self.data = data
        if(self.data.get('t')):
            self.data['time'] = self.data.get('t')
        if(self.data.get('close')):
            self.data['lastPrice'] = self.data.get('close')
        for i in range(len(self.observers)):
            # try:
            if(self.simulations[i] == bool(data.get('sm'))):
                self.observers[i].update(self)
            # except:
            #     print("Exception in the observer {}", self.observers[i])

    def attach(self, observer, simulation=False):
        self.simulations.append(simulation)
        Subject.attach(self, observer)
        print('Attached; ',self.observers)

    def detach(self, observer, index=None):
        if(observer):
            Subject.detach(self, observer)
            for i in range(len(self.observers)):
                if(observer == self.observers[i]):
                    self.simulations.pop(i)
            return
        self.simulations.pop(self.observers[index])
        self.observers.pop(index)
        print('Detached; ',(self.observers))

    def simulate(self, start_time=None, end_time=None, real_time=None, callback=None):
        thread = Thread(target=self.start_simulation, args=(start_time, end_time, real_time, callback))
        thread.start()
        return thread

    def backtest(self, data=None, callback=None):
        thread = Thread(target=self.start_backtest, args=(data, callback))
        thread.start()
        return thread

    def automate(self, tokens=[], history=None, auth=None, callback = None):
        queue = Queue()
        p = Process(target=self.start_automation, args=(tokens, history, auth, queue), daemon=False)
        p.start()
        while(True):
            try:
                msg = queue.get(block=True)
                print(msg)
                self.notify(msg)
            except Exception as e:
                print(e)
        return queue

    def start_simulation(self, start_time=None, end_time=None, real_time=False, callback=None):
        global no_save
        no_save = True
        date_format = '%m-%d-%Y'
        self.start_time = datetime.strptime(start_time, date_format)
        self.end_time = (end_time, datetime.strptime(end_time, date_format))[end_time is not None]
        cur_date = self.start_time
        datestring = cur_date.strftime(date_format)
        endstring = self.end_time.strftime(date_format)
        prev = None
        #for now starting from start_date 9:15AM to end_date H:MM
        print("Starting Simulation: {}".format(datestring))
        with open("{}\\{}.csv".format(self.filepath, datestring)) as f:
            headers = next(f).strip().split(', ')
            while(True):
                try:
                    row = next(f).strip().split(', ')
                    data = {'sm': False}
                    for x in range(len(row)):
                        if(headers[x] == 'lastPrice'):
                            row[x] = float(row[x])
                        data[headers[x]] = row[x]
                    if(real_time):
                        now = int(data['time'])
                        if prev:
                            time.sleep(now - prev) #WARNING - prev is unassigned
                        prev = now
                    self.notify(data)
                    #need to combine even next day for combining the flow
                except StopIteration:
                    datestring = cur_date.strftime(date_format)
                    if(datestring == endstring or self.end_time is None):
                        break
                    else:
                        cur_date = cur_date + timedelta(days=1)
                        print("Starting Simulation: {}".format(cur_date.strftime(date_format)))
                        f = open("{}\\{}.csv".format(self.filepath, cur_date.strftime(date_format)))
                        next(f) #to skip the header in the next file, calling this
        if callback:
            callback()

    def start_backtest(self, data=[], callback=None):
        if(len(data) < 2):
            print("Need FromDate and ToDate")
        params = {
            'instrument_tokens[]': data[2],
            'from': data[0],
            'to': data[1]
        }
        stream = requests.get(urls['stream_history'], params=params, stream=True)
        for line in stream.iter_lines():
            tick = dict()
            tick['time'], tick['open'], tick['high'], tick['low'], tick['close'], tick['volume'], tick['token'], tick['interval'] = json.loads(line.decode('utf-8'))
            tick['sm'] = False
            tick['isCandle'] = True
            tick['time'] = int(datetime.strptime(tick['time'],'%Y-%m-%dT%H:%M:%S+0530').timestamp())
            self.notify(tick)
        if callback:
            callback()

    def start_automation(self, tokens, history, auth, queue, callback=None):
        kws = KiteTicker("kitefront", "wPXXjA5tJE8KJyWN753rbGnf5lXlzU0Q")
        self.load_history(tokens, history, auth)
        kws.socket_url = "wss://ws.zerodha.com/?api_key=kitefront&user_id=MK4445&public_token=wPXXjA5tJE8KJyWN753rbGnf5lXlzU0Q&uid=1587463057403&user-agent=kite3-web&version=2.4.0"
        print("Started separate process for data feed")
        def on_ticks(ws, ticks):
            for tick in ticks:
                tick['lastPrice'] = tick['last_price']
                tick['token'] = tick['instrument_token']
                tick['time'] = int(datetime.now().timestamp())
                queue.put(tick, block=False)

        def on_connect(ws, response):
            ws.subscribe(tokens)

        def on_close(ws, code, reason):
            ws.stop()
            exit()

        kws.on_ticks = on_ticks
        kws.on_connect = on_connect
        kws.on_close = on_close
        kws.connect()

    def load_history(self, tokens, history, auth):
        fromTime = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
        toTime = datetime.now()
        for token in tokens:
            print("Loading history for {}".format(token))
            candles = history.get_raw_data(token, 1, fromTime, toTime, auth)
            for candle in candles:
                tick = dict()
                candle[-1] = int(token)
                candle.append(60)
                tick['time'], tick['open'], tick['high'], tick['low'], tick['close'], tick['token'], tick['interval'] = candle
                tick['sm'] = False
                tick['isCandle'] = True
                tick['noTrade'] = True
                tick['time'] = int(datetime.strptime(
                    tick['time'], '%Y-%m-%dT%H:%M:%S+0530').timestamp())
                self.notify(tick)

class DataSaver(Observer):
    def __init__(self, filepath):
        self.filepath = filepath
        fileName = datetime.today().strftime("%m-%d-%Y")
        self.fileName = "{}\\{}.csv".format(self.filepath, fileName)
        mypath = None
        try:
            mypath = Path(self.fileName)
            if(mypath.stat().st_size == 0):
                mypath = "new"
        except:
            mypath = "new"
            if(mypath == "new"):  # True if empty
                columns = ['mode', 'token', 'isTradeable', 'volume', 'lastQuantity', 'totalBuyQuantity', 'totalSellQuantity',
                        'lastPrice', 'averagePrice', 'openPrice', 'highPrice', 'lowPrice', 'closePrice', 'change', 'absoluteChange', 't']
                with open(self.fileName, "a+") as f:
                    f.write(', '.join(columns))
                    f.write('\n')

    def get_time(self):
        return datetime.now().time()

    def update(self, data):
        if(not no_save):
            stock = data.data
            if(not (self.get_time() >= datetime.strptime("09:00","%H:%M").time() and self.get_time() <= datetime.strptime("15:30","%H:%M").time())):
                return
            with open(self.fileName, "a+") as f: #TODO need to clarify the different file open types
                output = []
                for key in stock:
                    output.append(stock[key])
                f.write(', '.join(["{}".format(x) for x in output]))
                f.write('\n')
