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

dataFeed = DataFeed()
process_args = ['C:\\Program Files\\nodejs\\node.exe','D:\\programs\\nseTools\\zerodha\\zerodha_socket.js']
urls = {
    'start_process': 'http://localhost:3000/auto/start_process',
    'order_bo': 'http://localhost:3000/order/bo'
}
storage = {
    'phase': 'init'
}
instruments = pd.read_csv("D:\\programs\\nseTools\\zerodha\\instruments.csv")
history = History(url="https://kitecharts-aws.zerodha.com/api/chart/{}/{}?from={}&to={}", instruments=instruments)

orb_tokens = []
collector = Collector(orb_tokens, timeperiod=600)
candles = {}
noise_factor = 0
target = 0.7
stoploss = -1.1
recording_time = 60
trading_time = 60
trade_quantity = 100

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

####------------ SECTION FOR ORB BREAKOUTS
def start_orb():  # at 9:13 AM this method gets executed
    r = requests.get("http://localhost:3000/orb/stocks")
    stocks = json.loads(r.content)['stocks']
    for stock in stocks:
        if stock:
            try:
                token = int(history.get_instrument_token(stock['name'], "NSE", "EQ"))
                orb_tokens.append(token)
            except:
                print("Exception in {}".format(stock['name']))
    pipe_data = {
        'status': "subscription",
        'data': orb_tokens
    }
    storage['pipe'].write(json.dumps(pipe_data))

def orb_record():  # at 9:15 AM this get executed
    global storage 
    collector.start_collector()
    print("Recording data from zerodha websocket")
    storage['phase'] = 'record'


def orb_breakout():  # and at 9:20 AM this method gets executed
    #from collection get highs and lows
    global storage
    storage['candles'] = collector.get_partial_candles()
    print("Trading the breakout")
    storage['phase'] = 'breakout'

def orb_end(): # end the trade after 5 minutes
    global storage
    storage['phase'] = 'end'
    print("Ending the breakout trading")
    pprint(storage['candles'])
    profit = 0
    for token in storage['candles']:
        candle = storage['candles'][token]
        profit = profit + (candle.get('traded') or 0)
    print("Total Profit: {}".format(profit))


def orb_func(data):
    if(data['status'] != 'success'):
        return
    if(storage['phase'] == "record"):
        #start recording into collector
        collector.collect_price(data['data'])
    if(storage['phase'] == "breakout"):
        #TODO start comparing with highs and lows
        #TODO calculating the size of the day start candle
        #TODO calculating the bearishness and bullishness
        #TODO finding the volume of trades taking place at that time, like finding the surge
        #TODO tracking all the timeframe window
        for d in data['data']:
            try:
                candles = storage['candles']
                price = d['lastPrice']
                if(candles[d['token']]):
                    candle = candles[d['token']]
                    candle['ltp'] = price
                    if(candle.get('exit') is not None):
                        continue
                    if(candle.get('enter') is not None):
                        t = 0
                        enter = candle['enter']
                        if(candle['dir'] == "up"):
                            t = price - enter
                        if(candle['dir'] == "down"):
                            t = enter - price
                        if(t > target):
                            candle['exit'] = price
                            candle['traded'] = t
                            order = {
                                '_id': candle['id'],
                                'exitTime': round(time.time() * 1000),
                                'exitPrice': price
                            }
                            requests.put(urls['order_bo'], json={'bo': order})
                        elif(t < stoploss):
                            candle['exit'] = price
                            candle['traded'] = t
                            order = {
                                '_id': candle['id'],
                                'exitTime': round(time.time() * 1000),
                                'exitPrice': price
                            }
                            requests.put(urls['order_bo'], json={'bo': order})
                    elif(price > (candle['high'] + noise_factor)):
                        #TODO take long trade, with stop loss and target
                        candle['enter'] = price
                        candle['dir'] = "up"
                        order = {
                            'type': 'buy',
                            'stock': d['token'],
                            'entryPrice':price,
                            'entryTime': round(time.time() * 1000),
                            'quantity': trade_quantity
                        }
                        res = requests.post(urls['order_bo'], json={'bo': order})
                        res = json.loads(res.content.decode('utf-8'))['data']
                        candle['id'] = res["_id"]
                        print("{} Long: {}: {}".format(datetime.now().strftime("%H:%M:%S"), d['token'], price))
                        
                    elif(price < (candle['low'] - noise_factor)):
                        #TODO take short trade, with stop loss and target
                        candle['enter'] = price
                        candle['dir'] = "down"
                        order = {
                            'type': 'sell',
                            'stock': d['token'],
                            'entryPrice': price,
                            'entryTime': round(time.time() * 1000),
                            'quantity': trade_quantity
                        }
                        res = requests.post(urls['order_bo'], json={'bo': order})
                        res = json.loads(res.content.decode('utf-8'))['data']
                        candle['id'] = res["_id"]
                        print("{} Short: {}: {}".format(datetime.now().strftime("%H:%M:%S"), d['token'], price))
            except ValueError as error:
                print("Exception")
                print(error)

####------------------ END OF SECTION
def scheduler():
    global dataFeed
    global orb_tokens
    orb = OpenRangeBreakout(orb_tokens)
    dataFeed.attach(orb)
    #replace the timer with scheduler
    schedule.every().day.at("09:13").do(start_orb)
    schedule.every().day.at("09:15").do(orb_record)
    schedule.every().day.at("09:20").do(orb_breakout)
    while(True):
        schedule.run_pending()
        time.sleep(1)
    # time.sleep(1)
    # start_orb()
    # time.sleep(1)
    # orb_record()
    # time.sleep(recording_time)
    # orb_breakout()
    # time.sleep(trading_time)
    # orb_end()

def start_automation(data, result):
    print("Starting Automation")
    #start the websocket streaming in nodejs process
    (chi, par) = Pipe(True)
    pipe = WebSocketPipe(process_args, par, chi)
    storage['pipe'] = pipe
    thread = Thread(target=web_socket, args=(pipe,))
    result['r'] = {
        'handler': 'start_automation',
        'status': 'success'
    }
    thread.start()
    print("Independent Websocket thread started")
    print("Scheduling Open Range Breakout")
    scheduler_thread = Thread(target=scheduler)
    scheduler_thread.start()

def send_automation_data(data, result):
    storage['pipe'].write(json.dumps(data))
    result['r'] = {
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

def print_socket_data(data):
    pprint(data)

def web_socket(pipe):
    global dataFeed
     #record the live data for the process
    while(True):
        # try:
        data = pipe.read().decode('utf-8')
        data = json.loads(data)
        dataFeed.notify(data)
        if(data['status'] == 'exit'):
            write_to_node({
                'handler': 'end_automation',
                'status': 'success'
            })
            break
        # except Error as error:
        #     print(error)
        #     write_to_node({
        #         'handler': 'send_automation_data',
        #         'status': 'error'
        #     })
        #     break

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
