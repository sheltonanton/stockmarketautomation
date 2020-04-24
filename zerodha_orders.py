
from kiteconnect import KiteTicker
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
from datetime import date, datetime, timedelta
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
feedLogger = logging.getLogger('feedLogger')
q1 = q2 = None
sm = tm = ssm = stm = None
q1 = Queue()

dataFeed = DataFeed(save=True, filepath='D:\\programs\\nseTools\\zerodha\\output')
process_args = ['C:\\Program Files\\nodejs\\node.exe', '--inspect=7000', 'D:\\programs\\nseTools\\zerodha\\zerodha_socket.js']
instruments = pd.read_csv("D:\\programs\\nseTools\\zerodha\\instruments.csv")
history = History(url=urls['get_history_kite'], instruments=instruments)

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
        
def start_ws_stream(data={}, load_past = True):
    global storage
    if(data):
        stocks = data['stocks']
    else:
        r = requests.get(urls['stocks'])
        stocks = json.loads(r.content)['stocks']
    tokens = [int(x.get('token')) for x in stocks]
    storage['tokens'] = tokens
    storage['continueMain'] = True

    print("Historical Data Loaded")
    print("Websocket streaming started")

def start_automation(data={}):
    global sm
    global tm
    print("Starting Automation")
    sm.load_strategies(strategies=data.get('strategies'))
    trades = {}
    for s in data.get('strategies'):
        if(s.get('trades')):
            trades[s['_id']+"_"+s['token']] = s['trades']
    tm.load_trades(trades=trades)
    dataFeed.attach(sm)
    dataFeed.attach(tm)
    start_ws_stream(data=data, load_past=True)
    logger.info("Attached to dataFeed; {}".format(sm))
    logger.info("Attached to dataFeed; {}".format(tm))
    logger.info("Started Automation")
    return {
        'handler': 'start_automation',
        'status': 'success',
        'report': "nothing"
    }

def simulation_callback():
    global ssm
    global stm
    dataFeed.detach(ssm)
    dataFeed.detach(stm)
    stm.stop()

def simulate_automation(data):
    global ssm
    global stm
    print("Simulating Automation")
    for datestring in data.get('dates'):
        q2 = Queue()
        #for simulation
        ssm = StrategyManager(outputPipe=q2)
        stm = TradeManager(inputPipe=q2, simulation=True)
        #start the datafeed dummy transaction

        ssm.load_strategies(strategies=data.get('strategies'))
        trades = {}
        pprint(data)
        for s in data.get('strategies'):
            if(s.get('trades')):
                trades[s['_id']+"_"+s['token']] = s['trades']
        stm.load_trades(trades=trades)
        
        dataFeed.attach(ssm, simulation=False)
        dataFeed.attach(stm, simulation=False)

        dataFeed.simulate(
            start_time=datestring, 
            end_time=datestring,
            real_time=data.get('realTime'),
            callback=simulation_callback).join() #realTime bool - for real lagging
        print("Simulation Ended")
    return {
        'handler': 'simulate_automation',
        'status': 'success'
    }

def backtest_callback():
    global ssm
    global stm
    logger.info("End of dataFeed")
    logger.info("End of backtest")
    logger.info("Generating Report")

    report = stm.get_report()
    reportLogger.info("\n" + json.dumps(report))
    dataFeed.detach(ssm)
    dataFeed.detach(stm)
    stm.stop()

def run_backtest(data):
    global ssm
    global stm
    args = data.get('args')
    logger.info("Running backtest from {} to {} in {}".format(*args))
    
    q2 = Queue()
    ssm = StrategyManager(outputPipe=q2)
    stm = TradeManager(inputPipe=q2, simulation=True)
    ssm.load_strategies(strategies=data.get('strategies'))
    trades = {}
    for s in data.get('strategies'):
        if(s.get('trades')):
            # s['trades'] = list(map(lambda x: x.update({'trader':'simulated', 'strategy': s['name']}) or x, s['trades']))
            trades[s['_id']+"_"+s['token']] = s['trades'] #TODO need to generalize it for extending more
    dataFeed.attach(ssm, simulation=False)
    dataFeed.attach(stm, simulation=False)
    logger.info("Attached to dataFeed; {}".format(ssm))
    logger.info("Attached to dataFeed; {}".format(stm))
    stm.load_trades(trades=trades)
    dataFeed.backtest(
        data = args,
        callback = backtest_callback
    )
    return {
        'handler': 'run_backtest',
        'status': 'success',
        'report': "nothing"
    }

def send_automation_data(data):
    # storage['ws_pipe'].write(json.dumps(data))
    return { #TODO remove this kind of communication
        'handler': 'send_automation_data',
        'status': 'success'
    }

def send_automation_subscription(data):
    stocks = data['data']
    tokens = []
    for stock in stocks:
        if stock:
            tokens.append(int(history.get_instrument_token(stock, 'NSE', 'EQ')))
    data['data'] = tokens
    send_automation_data(data)
    return {
        'handler': 'send_automation_subscription',
        'status': 'success'
    }

def stop_automation(data):
    global sm
    global tm
    dataFeed.detach(sm)
    dataFeed.detach(tm)
    tm.stop()
    # storage['ws_pipe'].write(json.dumps({'status':'exit'}))
    return {
        'handler': 'stop_automation',
        'status': 'success'
    }

def force_stop(data):
    return {
        'handler': 'force_stop',
        'status': 'success'
    }
    sys.exit()

def add_strategy(data):
    print(data)
    sm.add_strategy()
    return {
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


def start_ticker(tokens, history, auth='', callback=None):
    kws = KiteTicker("kitefront", "wPXXjA5tJE8KJyWN753rbGnf5lXlzU0Q")
    kws.socket_url = "wss://ws.zerodha.com/?api_key=kitefront&user_id=MK4445&public_token=wPXXjA5tJE8KJyWN753rbGnf5lXlzU0Q&uid=1587463057403&user-agent=kite3-web&version=2.4.0"
    print("Started separate process for data feed")

    def on_ticks(ws, ticks):
        for tick in ticks:
            tick['lastPrice'] = tick['last_price']
            tick['token'] = tick['instrument_token']
            tick['time'] = int(datetime.now().timestamp())
            print(tick)
            dataFeed.notify(tick)

    def on_connect(ws, response):
        ws.subscribe(storage['tokens'])

    def on_close(ws, code, reason):
        pass

    kws.on_ticks = on_ticks
    kws.on_connect = on_connect
    kws.on_close = on_close
    while(True):
        if(storage.get('continueMain')):
            break
        time.sleep(2)
    load_history(storage['tokens'], history, auth)
    print("WebSocket Connected")
    kws.connect()

def load_history(tokens, history, auth):
    fromTime = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
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
            dataFeed.notify(tick)
    print("History Loaded")


def main(handlers):
    app = Flask(__name__)
    api = Api(app)

    class Response(Resource):
        def post(self):
            r = request.json['data']
            try:
                return handlers[r['handler']](r['data'])
            except:
                print("Exception")

    api.add_resource(Response, '/')
    auth = None
    while True:
        try:
            auth = requests.get(urls['start_process'])
            break
        except:
            print("Polling")
            continue
    thread = Thread(target=app_start, args=(app,))
    thread.start()
    start_ticker([], history, auth=auth.content)
    thread.join()

def app_start(app):
    app.run(debug=False)
    
main(handlers)
