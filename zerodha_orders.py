
import logging
import logging.config
logging.config.fileConfig(fname='logger.conf', disable_existing_loggers=False)

import pdb
import sys
import time
import json
import pdb
import pandas as pd
import numpy as np
import requests
import schedule
from collections import defaultdict
from datetime import date, datetime
from multiprocessing import Process, Queue, Pipe
from threading import Thread, Lock
from pprint import pprint
from flask import Flask, request
from flask_restful import Resource, Api
import matplotlib.pyplot as plt

sys.path.append("D:\\programs\\nseTools\\zerodha\\lib")
from autotrade import History, Collector
from manager import TradeManager,DateManager
from pipe import WebSocketPipe
from open_range_breakout import OpenRangeBreakout
from data_feed import DataFeed
from mapping import urls
from strategy import StrategyManager

logger = logging.getLogger('flowLogger')
reportLogger = logging.getLogger('reportLogger')
q1 = q2 = None
sm = tm = ssm = stm = None
q1 = Queue()

dataFeed = DataFeed(save=True, filepath='D:\\programs\\nseTools\\zerodha\\output')
process_args = ['C:\\Program Files\\nodejs\\node.exe','D:\\programs\\nseTools\\zerodha\\zerodha_socket.js']
instruments = pd.read_csv("D:\\programs\\nseTools\\zerodha\\instruments.csv")
history = History(url="https://kitecharts-aws.zerodha.com/api/chart/{}/{}?from={}&to={}", instruments=instruments)

#for live trade
sm = StrategyManager(outputPipe=q1)
tm = TradeManager(inputPipe=q1)
storage = {}

#-----------------------------------------------------ALL PROCESS THREADS METHODS-----------------------------------------------------
def get_instruments(data, result):
    output = {}
    if 'filters' not in data.keys():
        all_stocks = instruments[(instruments['instrument_type'] == "EQ") & (instruments['segment'] == 'NSE')]
        all_stocks = all_stocks.loc[:, ['instrument_token','tradingsymbol']]
        output['stocks'] = all_stocks.values.tolist()
    result['r'] = {
        'handler': 'get_instruments',
        'status': 'success',
        'data': output
    }

class Buffer:
    def __init__(self, default=list):
        self.default = list
        self.buffer = None
        self.stream = None
        self.__initialize()

    def __initialize(self):
        self.stream = self.buffer
        if(self.default):
            self.buffer = defaultdict(list)
        else:
            self.buffer = {}

    def store(self, key, value):
        if(key):
            self.buffer[key] = value
            return True
        return False

    def get(self, key):
        return self.buffer.get(key)

    def start_stream(self):
        self.__initialize()

    def finish_stream(self):
        self.stream = None
        self.stream_finished = True

    def is_stream_finished(self):
        return (self.stream_finished is not None)
        
def start_ws_stream(data={}, result={}, load_past = True):
    global storage
    (chi, par) = Pipe(True)
    pipe = WebSocketPipe(process_args, par, chi)
    buffer = Buffer()
    storage['ws_pipe'] = pipe
    thread = Thread(target=web_socket, args=(pipe, buffer))
    thread.start()

    tokens = []
    stocks = None
    if(data):
        stocks = data['stocks']
    else:
        r = requests.get(urls['stocks'])
        stocks = json.loads(r.content)['stocks']

    dm = DateManager()
    current_time = dm.time(string_format="%Y-%m-%d")
    past_time = dm.time(days=-2, string_format="%Y-%m-%d")

    for stock in stocks:
        if stock:
            try:
                if(not stock.get('token')):
                    token = int(history.get_instrument_token(
                        stock['name'], "NSE", "EQ"))
                    tokens.append(token)
                    stock['token'] = int(token)
                else:
                    tokens.append(int(stock['token']))
            except:
                print("Exception in {}".format(stock['name']))
    pipe_data = {
        'status': "subscription",
        'data': tokens
    }
    storage['tokens'] = tokens
    storage['stocks'] = stocks
    pipe.write(json.dumps(pipe_data))  # subscribed to the tokens in websocket
    #start the websocket streaming in nodejs process
    for stock in stocks:  # load the historical data into the buffer
        if stock:
            try:
                logger.info("Downloading historical data: {}".format(stock))
                history_data = history.get_raw_data(
                    stock['token'], 1, past_time, current_time)
                live_data = buffer.get(int(stock['token'])) or []
                last_history_data_time = int(datetime.strptime(history_data[-1][0], '%Y-%m-%dT%H:%M:%S+0530').timestamp())
                logger.info("Last History record: {}".format(history_data[-1]))
                while(True):
                    if(live_data):
                        ld = int(live_data[0].get('time') or live_data[0].get('t'))
                        if(ld < last_history_data_time + 60):
                            live_data.pop(0)
                    else:
                        break
                logger.info("Live data from buffer: {}".format(live_data))
                history_data.extend(live_data)
                buffer.store(int(stock['token']), history_data)
            except Exception as e:
                logger.exception(e)
    buffer.start_stream()
    print("Websocket streaming started")

def start_automation(data={}, result={}):
    global sm
    global tm
    print("Starting Automation")
    start_ws_stream(data=data, result=result, load_past = True)
    sm.load_strategies(strategies=data.get('strategies'))
    trades = {}
    for s in data.get('strategies'):
        if(s.get('trades')):
            trades[s['_id']+"_"+s['token']] = s['trades']
    tm.load_trades(trades=trades)
    dataFeed.attach(sm)
    dataFeed.attach(tm)
    logger.info("Attached to dataFeed; {}".format(sm))
    logger.info("Attached to dataFeed; {}".format(tm))
    logger.info("Started Automation")

def simulation_callback():
    global ssm
    global stm
    dataFeed.detach(ssm)
    dataFeed.detach(stm)
    stm.stop()

def simulate_automation(data, result):
    global ssm
    global stm
    print("Simulating Automation")
    for datestring in data.get('dates'):
        q2 = Queue()
        #for simulation
        ssm = StrategyManager(outputPipe=q2)
        stm = TradeManager(inputPipe=q2, simulation=True)
        #start the datafeed dummy transaction
        # start_orb(None, simulation=True)
        ssm.load_strategies(strategies=data.get('strategies'))
        trades = {}
        for s in data.get('strategies'):
            trades[s['_id']] = s['trades']
        dataFeed.attach(ssm, simulation=True)
        stm.load_trades(trades=trades)
        # stm.start()
        dataFeed.simulate(
            start_time=datestring, 
            end_time=datestring,
            real_time=data.get('realTime'),
            callback=simulation_callback).join() #realTime bool - for real lagging
        print("Simulation Ended")

def run_backtest(data, result):
    global ssm
    global stm
    backtestdata = {'candles':{}, 'interval': 1}
    args = data.get('args')
    logger.info("Running backtest from {} to {} in {}".format(*args))
    
    q2 = Queue()
    ssm = StrategyManager(outputPipe=q2)
    stm = TradeManager(inputPipe=q2, simulation=True)
    ssm.load_strategies(strategies=data.get('strategies'))
    trades = {}
    for s in data.get('strategies'):
        if(s.get('trades')):
            s['trades'] = list(map(lambda x: x.update({'trader':'simulated'}) or x, s['trades']))
            trades[s['_id']+"_"+s['token']] = s['trades']
        if(not backtestdata.get(s['token'])):
            d = history.get_raw_data(
                s["token"],
                args[2],
                datetime.strptime(args[0], '%m-%d-%Y').strftime('%Y-%m-%d'),
                datetime.strptime(args[1], '%m-%d-%Y').strftime('%Y-%m-%d')
            )
            backtestdata['candles'][s['token']] = d
    backtestdata['interval'] = int(args[2])
    dataFeed.attach(ssm, simulation=True)
    dataFeed.attach(stm, simulation=True)
    logger.info("Attached to dataFeed; {}".format(ssm))
    logger.info("Attached to dataFeed; {}".format(stm))
    stm.load_trades(trades=trades)
    dataFeed.backtest(
        data = backtestdata,
        callback = None
    ).join()
    logger.info("End of dataFeed")
    simulation_callback()
    logger.info("End of backtest")
    logger.info("Generating Report")
    # figures = ssm.get_chart()
    # for stock in figures:
    #     f1 = figures[stock]
    #     for strategy in f1:
    #         figure = f1[strategy]
    #         figure.savefig('output/figures/{}_{}.png'.format(stock, strategy))

    report = stm.get_report()
    reportLogger.info("\n" + json.dumps(report))
    result['r'] = {
        'handler': 'run_backtest',
        'status': 'success',
        'report': report
    }

def send_automation_data(data, result):
    storage['ws_pipe'].write(json.dumps(data))
    result['r'] = { #TODO remove this kind of communication
        'handler': 'send_automation_data',
        'status': 'success'
    }

def send_automation_subscription(data, result):
    stocks = data['data']
    tokens = []
    for stock in stocks:
        if stock:
            tokens.append(int(history.get_instrument_token(stock, 'NSE', 'EQ')))
    data['data'] = tokens
    send_automation_data(data, result)

def stop_automation(data, result):
    global sm
    global tm
    dataFeed.detach(sm)
    dataFeed.detach(tm)
    tm.stop()
    storage['ws_pipe'].write(json.dumps({'status':'exit'}))
    result['r'] = {
        'handler': 'stop_automation',
        'status': 'success'
    }

def force_stop(data, result):
    result['r'] = {
        'handler': 'force_stop',
        'status': 'success'
    }
    sys.exit()

def add_strategy(data, result):
    print(data)
    sm.add_strategy()
    result['r'] = {
        'handler': 'add_strategy',
        'status': 'success'
    }

handlers = {
    'get_instruments': get_instruments,
    'start_automation': start_automation,
    'simulate_automation': simulate_automation,
    'run_backtest': run_backtest,
    'send_automation_data': send_automation_data,
    'send_automation_subscription': send_automation_subscription,
    'stop_automation': stop_automation,
    'force_stop': force_stop,
    'start_ws_stream': start_ws_stream
}

#------------------------------------------------- ALL UTILITY, STREAM READ AND STREAM WRITE FUNCTIONS ----------------------------------------------------
def read_from_node():
    line = input()
    return json.loads(line)

def write_to_node(data):
    requests.post('http://localhost:3000/auto/process', data=data)
    
def read_from_socket(pipe):
    message = pipe.recv()
    return message

def write_to_socket(pipe, data):
    pipe.send(data)

def web_socket(pipe, buffer=None):
    global dataFeed
     #record the live data for the process
    while(True):
        # try:
        if buffer and buffer.stream:
            for token in buffer.stream:
            # list of data along with historical and currently stored ticks
                ticks = buffer.stream[token]
                for tick in ticks:
                    a = {}
                    a['time'], a['open'], a['high'], a['low'], a['close'], a['volume'] = tick
                    a['sm'] = False
                    a['isCandle'] = True
                    a['time'] = int(datetime.strptime(
                        a['time'], '%Y-%m-%dT%H:%M:%S+0530').timestamp())
                    a['interval'] = 60  # in seconds
                    a['token'] = token
                    a['noTrade'] = True
                    dataFeed.notify(a)
                logger.info("PAST DATA LOADED")
            buffer.finish_stream()

        data = pipe.read().decode('utf-8')
        data = json.loads(data)
        if(data['status'] == 'success'):
            if(type(data['data']) is list): #list for price data feed
                for d in data['data']:
                    if buffer.is_stream_finished():
                        dataFeed.notify(d)
                    else:
                        stock = buffer.setdefault(int(d['token']), [])
                        stock.append(d)

            if(type(data['data']) is dict): #dict for json object
                tm.update(data['data'])
        if(data['status'] == 'exit'):
            write_to_node({
                'handler': 'end_automation',
                'status': 'success'
            })
            break
        if(data['status'] == 'console'):
            print(data['data'])
        # except:
        #     print("Exception and Exit in Data Feed Thread")
        #     exit()

def process_thread(handler, data, result):
    try:
        thread = Thread(target=handlers[handler], args=(data, result))
        thread.start()
        return thread
    except:
        print("Exception")
        result['r'] = {
            'handler': handler,
            'status': 'error'
        }
    return None
    
def main(handlers):
    app = Flask(__name__)
    api = Api(app)

    class Response(Resource):
        def post(self):
            r = request.json['data']
            result = {'r':{}}
            try:
                thread = process_thread(r['handler'], r['data'], result)
                thread.join()
                return result['r']
            except:
                print("Exception")

    api.add_resource(Response, '/')
    while True:
        try:
            requests.get(urls['start_process'])
            break
        except:
            print("Polling")
            continue

    app.run(debug=False)
    
main(handlers)
