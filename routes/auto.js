const express = require('express');
const axios = require('axios');
const event = require('./events');
const router = express.Router();

const Entry = require('../models/entry');
const MinHeap = require('../public/javascripts/utils/minheap');
const {
    getTrader
} = require('../zerodha_orders');

var pyscript = null;

/* GET INSTRUMENTS */
router.post('/instruments', function (req, res, next) {
    pyscript && pyscript.process_data('get_instruments', req.body, (result, err) => {
        event.notifications.push("Obtained instruments with its tokens");
        res.send(result)
        return;
    })
    !pyscript && process_not_started(res)
})

/* RUN AUTOMATION */
router.get('/start_automation', async function(req, res, next){
    var s = [], t = [], stocks={};
    event.notifications.push("Starting Automation")
    //get all entries
    entries = await Entry.find({}).populate('strategy').populate('counter').populate('trade').populate('stocks')
    //get the strategies associated with the entries
    //TODO CLEANUP change this method of data provider and come up with a clean way
    for(var entry of entries){
        for(var stock_in_entry of entry.stocks){
            var strategy = entry.strategy.toJSON()
            strategy.status = entry.status
            strategy.trades = [entry.trade] //TODO important trades should be an array, change the database schema
            strategy.name = entry.strategy.name
            strategy.stock = stock_in_entry.name
            strategy.token = stock_in_entry.token
            stocks[stock_in_entry.name] = stock_in_entry.token
            //get the counter strategies
            if (entry.counter) {
                var counter = entry.counter.toJSON()
                counter.stock = stock_in_entry.name
                counter.token = stock_in_entry.token
                strategy.counter = entry.counter["_id"].toString()
                s.push(counter)
            }
            //assign trade according to that
            s.push(strategy)
        }
    }
    stocks = Object.keys(stocks).map(s => {
        return {
            name: s,
            token: stocks[s]
        }
    })
    let trader = await getTrader();
    data = {
        strategies: s,
        stocks,
        auth: trader.getAuth()
    }
    pyscript && pyscript.process_data('start_automation', data, (result, err) => {
        event.notifications.push("Started Automation")
        res.send(result)
        return;
    })
    !pyscript && process_not_started(res);
})

/* RUN AUTOMATION AS SIMULATION */
router.post('/simulate', async function(req, res, next){
    let dates = req.body.data
    var s = [], t = [], stocks = {};
    entries = await Entry.find({}).populate('strategy').populate('counter').populate('trade').populate('stocks')
    for (var entry of entries) {
        for (var stock_in_entry of entry.stocks) {
            var strategy = entry.strategy.toJSON()
            strategy.status = entry.status
            strategy.trades = [entry.trade] //TODO important trades should be an array, change the database schema
            strategy.name = entry.strategy.name
            strategy.stock = stock_in_entry.name
            strategy.token = stock_in_entry.token
            stocks[stock_in_entry.name] = stock_in_entry.token
            //get the counter strategies
            if (entry.counter) {
                var counter = entry.counter.toJSON()
                counter.stock = stock_in_entry.name
                counter.token = stock_in_entry.token
                strategy.counter = entry.counter["_id"].toString()
                s.push(counter)
            }
            //assign trade according to that
            s.push(strategy)
        }
    }
    stocks = Object.keys(stocks).map(s => {
        return {
            name: s,
            token: stocks[s]
        }
    })
    let trader = await getTrader();
    data = {
        strategies: s,
        stocks,
        dates,
        auth: trader.getAuth()
    }
    pyscript && pyscript.process_data('simulate_automation', data, (result, err) => {
        if (result) {
            str = "Simulation Started for dates " + JSON.stringify(data.dates)
            event.notifications.push(str)
            res.send(result)
            return;
        } else {
            res.send(err)
        }
    })
})

/* RUN BACKTESTING */
router.post('/backtest', async function(req, res, next){
    let data = req.body['data']
    let set = new Set(); //set for identifying unique stocks
    data = {
        args: [...data]
    }
     var s = [],
         t = [];
     // all entries
     entries = await Entry.find({}).populate('strategy').populate('counter').populate('trade').populate('stocks')
     //get the strategies associated with the entries
     //TODO CLEANUP change this method of data provider and come up with a clean way
     for (var entry of entries) {
         for (var stock_in_entry of entry.stocks) {
             var strategy = entry.strategy.toJSON()
             strategy.status = entry.status
             strategy.trades = [entry.trade] //TODO important trades should be an array, change the database schema
             strategy.name = entry.strategy.name
             strategy.stock = stock_in_entry.name
             strategy.token = stock_in_entry.token
             set.add(stock_in_entry.token);
             //get the counter strategies
             if (entry.counter) {
                 var counter = entry.counter.toJSON()
                 counter.stock = stock_in_entry.name
                 counter.token = stock_in_entry.token
                 strategy.counter = entry.counter["_id"].toString()
                 s.push(counter)
             }
             //assign trade according to that
             s.push(strategy)
         }
     }
    data.strategies = s
    data.args.push(Array.from(set));
    pyscript && pyscript.process_data('run_backtest', data, (result, err) => {
        if(err){
            res.send(err)
        } else {
            res.send(JSON.stringify(result))
            str = "Backtesting Finished for dates " + JSON.stringify(data.args)
            event.notifications.push(str)
        }
    })
})

/*STREAM HISTORICAL DATA */
router.get('/get_historical', async function(req, res, next){
    var instrument_token = req.query['instrument_token'];
    var fromDate = req.query['from'];
    var toDate = req.query['to'];
    console.log(instrument_token, fromDate, toDate);
    let trader = await getTrader();
    response = await trader.getHistorical(instrument_token, fromDate, toDate);
    return res.send(response);
})

/* STREAM HISTORICAL DATA */
router.get('/stream_historical', async function(req, res, next){
    var instrument_tokens = req.query['instrument_tokens'];
    var fromDate = req.query['from'];
    var toDate = req.query['to'];
    console.log(instrument_tokens, fromDate, toDate);
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders(); // flush the headers to establish SSE with client

    //get all the stocks ticks and stream it in a specified manner - using min heap
    //construct min-heap of size instrument_tokens_length
    var history = [];
    var tokens = [];
    let trader = await getTrader();
    for(var token of instrument_tokens){
        response = await trader.getHistorical(token, fromDate, toDate);
        if(response.status == 'success'){
            history.push(response.data);
            tokens.push(token);
        }else{
            console.log("Error while fetching historical data for " + token);
        }
    }
    //construct the min heap out of the length of history, 
    //keep a variable of the row,column in the hash too, when popped, push the next value, delete the values and send
    let heap_initial = [];
    for(let i=0; i < history.length; i++){
        let h = history[i][0];
        h.token = tokens[i];
        h.row = i;
        h.col = 0;
        heap_initial.push(h);
    }
    let heap = new MinHeap(heap_initial, 0, function(a, b){
        return (new Date(a) - new Date(b));
    });
    //creating the streaming platform
    //open a keep-alive connection ( server-sent events )
    //pop one by one from the heap and send it through the connection
    function getNext(o){
        return o.col < history[o.row].length && history[o.row][o.col+1] || null;
    }
    function callback1(){
        if(heap.array.length == 0){
            clearInterval(interval);
            res.status(200).end();
            return;
        }
        let data = heap.popmin();
        let next = getNext(data);
        if (next != null) {
            next['row'] = data['row'];
            next['col'] = data['col'] + 1;
        }
        data[data.length - 1] = tokens[data['row']];
        data.push(60);
        delete data['row'];
        delete data['col'];
        res.write(JSON.stringify(data) + "\n");
        if (next != null) {
            heap.add(next);
        }
    }
    var interval = setInterval(callback1, 1);
});

/* STOP AUTOMATION */
router.get('/stop_automation', function(req, res, next){
    pyscript && pyscript.process_data('stop_automation', {}, (result, err) => {
        event.notifications.push("Stopped Automation")
        res.send(result)
    })
    !pyscript && process_not_started(res);
})

/* SUBSCRIBE TO STOCKS IN WEBSOCKET */
router.post('/subscribe', function(req, res, next){
    stocks = req.body.stocks;
    let data = {
        status: "subscription",
        data: stocks
    }
    pyscript && pyscript.process_data('send_automation_subscription',data, (result, err) => {
        event.notifications.push("Sent subscriptions: " + stocks.join(','))
        res.send(result)
    })
})

/* FORCE STOP PYTHON PROCESS */
router.get('/force_stop', function(req, res, next){
    pyscript && pyscript.process_data('force_stop', {}, (result, err) => {
        event.notifications.push("Python Process has been force stopped")
        res.send(result)
    })
    !pyscript && process_not_started(res)
})

/* PYTHON SERVER NOTIFIES THAT THE PROCESS HAS BEEN STARTED */
router.get('/start_process', async function(req, res, next){
    pyscript = {
        process_data
    }
    trader = await getTrader();
    auth = trader.getAuth();
    res.send(auth)
})
router.post('/process', function(req, res, next){
    data = req.body;
    //process the data from python process
    res.send({status: 'success'})
})

function process_not_started(res) {
    event.notifications.push("", "Process is not yet started. Start the python process first")
    res.send({
        status: 'error',
        data: {
            processSpawned: false
        },
        error: "Process is not yet started. Start the process first"
    })
}

function process_data(url, data, callback){
    data = {
        handler: url,
        data: data
    }
    axios({
        method: 'post',
        url: 'http://localhost:5000',
        data: {data},
        config: {headers: {'Content-Type': 'application/json'}}
    }).then(res => {
        callback(res.data, null)
    }).catch(err => {
        callback(null, err)
    })
}

pyscript = {process_data} //TODO temporary, need to replace with something robust

module.exports = router;
