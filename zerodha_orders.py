import sys
import time
import json
import pandas as pd
import numpy as np
import requests
import schedule
from datetime import date, datetime
from multiprocessing import Process, Pipe
from threading import Thread, Lock
from pprint import pprint
from flask import Flask, request
from flask_restful import Resource, Api

sys.path.append("D:\\programs\\nseTools\\zerodha\\lib")
from autotrade import History, Collector
from pipe import WebSocketPipe
from open_range_breakout import OpenRangeBreakout
from data_feed import DataFeed
from urls import urls

dataFeed = DataFeed(save=True, filepath='D:\\programs\\nseTools\\zerodha\\output')
process_args = ['C:\\Program Files\\nodejs\\node.exe','D:\\programs\\nseTools\\zerodha\\zerodha_socket.js']

instruments = pd.read_csv("D:\\programs\\nseTools\\zerodha\\instruments.csv")
history = History(url="https://kitecharts-aws.zerodha.com/api/chart/{}/{}?from={}&to={}", instruments=instruments)
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

def start_ws_stream(result):
    global storage
    (chi, par) = Pipe(True)
    pipe = WebSocketPipe(process_args, par, chi)
    storage['pipe'] = pipe
    thread = Thread(target=web_socket, args=(pipe,))
    result['r'] = {
        'handler': 'start_automation',
        'status': 'success'
    }
    thread.start()
    return pipe

def start_orb(pipe):  # at 9:13 AM this method gets executed
    tokens = []
    r = requests.get("http://localhost:3000/orb/stocks")
    stocks = json.loads(r.content)['stocks']
    for stock in stocks:
        if stock:
            try:
                token = int(history.get_instrument_token(stock['name'], "NSE", "EQ"))
                tokens.append(token)
                stock['token'] = token
            except:
                print("Exception in {}".format(stock['name']))
    pipe_data = {
        'status': "subscription",
        'data': tokens
    }
    pipe.write(json.dumps(pipe_data)) #subscribed to the tokens in websocket
    global orb
    orb = OpenRangeBreakout(tokens=tokens, stocks=stocks) #initialized open range breakout
    global orb_thread
    orb_thread = Thread(target=orb.start)
    orb_thread.start()
    dataFeed.attach(orb) #open range breakout is subscribed for any data

def stop_orb():
    global orb
    dataFeed.detach(orb)
    

def start_automation(data={}, result={}):
    print("Starting Automation")
    #start the websocket streaming in nodejs process
    pipe = start_ws_stream(result)
    print("Websocket streaming started")
    #starting open range breakout
    start_orb(pipe)
    print('Started open range breakout')
    

def send_automation_data(data, result):
    storage['pipe'].write(json.dumps(data))
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
    stop_orb()
    storage['pipe'].write(json.dumps({'status':'exit'}))
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

handlers = {
    'get_instruments': get_instruments,
    'start_automation': start_automation,
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
        # try:
        data = pipe.read().decode('utf-8')
        data = json.loads(data)
        if(data['status'] == 'success'):
            dataFeed.notify(data['data'])
        if(data['status'] == 'exit'):
            write_to_node({
                'handler': 'end_automation',
                'status': 'success'
            })
            break

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
    start_automation()
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
