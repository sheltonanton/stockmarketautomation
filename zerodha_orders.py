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
from multiprocessing import Process, Pipe
from threading import Thread, Lock
from pprint import pprint
from flask import Flask, request
from flask_restful import Resource, Api
import matplotlib.pyplot as plt

sys.path.append("D:\\programs\\nseTools\\zerodha\\lib")
from autotrade import History, Collector
from manager import TradeManager
from pipe import WebSocketPipe
from open_range_breakout import OpenRangeBreakout
from data_feed import DataFeed
from mapping import urls
from strategy import StrategyManager

p1 = p2 = sp1 = sp2 = None
sm = tm = ssm = stm = None
p1, p2 = Pipe()

dataFeed = DataFeed(save=True, filepath='D:\\programs\\nseTools\\zerodha\\output')
process_args = ['C:\\Program Files\\nodejs\\node.exe','D:\\programs\\nseTools\\zerodha\\zerodha_socket.js']
instruments = pd.read_csv("D:\\programs\\nseTools\\zerodha\\instruments.csv")
history = History(url="https://kitecharts-aws.zerodha.com/api/chart/{}/{}?from={}&to={}", instruments=instruments)

#for live trade
sm = StrategyManager(outputPipe=p1)
tm = TradeManager(inputPipe=p2)
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

def start_ws_stream():
    global storage
    (chi, par) = Pipe(True)
    pipe = WebSocketPipe(process_args, par, chi)
    storage['ws_pipe'] = pipe
    thread = Thread(target=web_socket, args=(pipe,))
    thread.start()
    tokens = []
    r = requests.get(urls['stocks'])
    stocks = json.loads(r.content)['stocks']
    for stock in stocks:
        if stock:
            try:
                token = int(history.get_instrument_token(
                    stock['name'], "NSE", "EQ"))
                tokens.append(token)
                stock['token'] = token
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
    print("Websocket streaming started")
    return pipe

# def start_orb(pipe, simulation=False):  # at 9:13 AM this method gets executed
#     if(simulation):
#         for i in range(len(dataFeed.observers)):
#             if(dataFeed.simulations[i]):
#                 dataFeed.detach(i)
#     global orb
#     orb = OpenRangeBreakout(tokens=storage['tokens'], stocks=storage['stocks'], timeframe=[6])  # initialized open range breakout
#     dataFeed.attach(orb, simulation=simulation) #open range breakout is subscribed for any data

# def stop_orb():
#     global orb
#     dataFeed.detach(observer = orb)
    

def start_automation(data={}, result={}):
    print("Starting Automation")
    #starting strategy manager
    sm.load_strategies(strategies=data.get('strategies'))
    dataFeed.attach(sm)
    trades = {}
    for s in data.get('strategies'):
        trades[s['_id']] = s['trades']
    tm.load_trades(trades=trades)
    tm.start()
    print('Started Automation')

def simulation_callback():
    dataFeed.detach(ssm)
    stm.stop()

def simulate_automation(data, result):
    for datestring in data.get('dates'):
        sp1, sp2 = Pipe()
        #for simulation
        ssm = StrategyManager(outputPipe=sp1)
        stm = TradeManager(inputPipe=sp2, simulation=True)
        #start the datafeed dummy transaction
        # start_orb(None, simulation=True)
        ssm.load_strategies(strategies=data.get('strategies'))
        trades = {}
        for s in data.get('strategies'):
            trades[s['_id']] = s['trades']
        dataFeed.attach(ssm, simulation=True)
        stm.load_trades(trades=trades)
        stm.start()
        dataFeed.simulate(
            start_time=datestring, 
            end_time=datestring,
            real_time=data.get('realTime'),
            callback=simulation_callback).join() #realTime bool - for real lagging
        print("Simulation Ended")

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
    dataFeed.detach(sm)
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
    'send_automation_data': send_automation_data,
    'send_automation_subscription': send_automation_subscription,
    'stop_automation': stop_automation,
    'force_stop': force_stop
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

def web_socket(pipe):
    global dataFeed
     #record the live data for the process
    while(True):
        data = pipe.read().decode('utf-8')
        data = json.loads(data)
        if(data['status'] == 'success'):
            if(type(data['data']) is list): #list for price data feed
                for d in data['data']:
                    dataFeed.notify(d)
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
            start_ws_stream()
            requests.get(urls['start_process'])
            break
        except:
            print("Polling")
            continue

    app.run(debug=False)
    
main(handlers)
