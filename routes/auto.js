const express = require('express');
const axios = require('axios');
const router = express.Router();
const Strategy = require('../models/strategy')
const Trade = require('../models/trade')
const Entry = require('../models/entry')
var pyscript = null;

/* GET INSTRUMENTS */
router.post('/instruments', function (req, res, next) {
    pyscript && pyscript.process_data('get_instruments', req.body, (result, err) => {
        express.ws_write("Obtained instruments with its tokens")
        res.send(result)
        return;
    })
    !pyscript && process_not_started(res)
})

/* RUN AUTOMATION */
router.get('/start_automation', async function(req, res, next){
    var s = [], t = [], stocks={};
    express.ws_write("Starting Automation")
    //get all entries
    entries = await Entry.find({}).populate('strategy').populate('counter').populate('trade').populate('stock')
    //get the strategies associated with the entries
    //TODO CLEANUP change this method of data provider and come up with a clean way
    for(var entry of entries){
        var strategy = entry.strategy.toJSON()
        strategy.status = entry.status
        strategy.trades = [entry.trade] //TODO important trades should be an array, change the database schema
        strategy.name = entry.strategy.name
        strategy.stock = entry.stock.name
        strategy.token = entry.stock.token
        stocks[entry.stock.name] = entry.stock.token
        //get the counter strategies
        if(entry.counter){
            var counter = entry.counter.toJSON()
            counter.stock = entry.stock.name
            counter.token = entry.stock.token
            strategy.counter = entry.counter["_id"].toString()
            s.push(counter)
        }
        //assign trade according to that
        s.push(strategy)
    }
    stocks = Object.keys(stocks).map(s => {
        return {
            name: s,
            token: stocks[s]
        }
    })
    data = {
        strategies: s,
        stocks
    }
    pyscript && pyscript.process_data('start_automation', data, (result, err) => {
        express.ws_write("Started Automation")
        res.send(result)
        return;
    })
    !pyscript && process_not_started(res);
})

/* RUN AUTOMATION AS SIMULATION */
router.get('/simulate', async function(req, res, next){
    let dates = req.body.data
    var s = [], t = [], stocks = {};
    entries = await Entry.find({}).populate('strategy').populate('counter').populate('trade').populate('stock')
    for (var entry of entries) {
        var strategy = entry.strategy.toJSON()
        strategy.status = entry.status
        strategy.trades = [entry.trade] //TODO important trades should be an array, change the database schema
        strategy.name = entry.strategy.name
        strategy.stock = entry.stock.name
        strategy.token = entry.stock.token
        stocks[entry.stock.name] = entry.stock.token
        //get the counter strategies
        if (entry.counter) {
            var counter = entry.counter.toJSON()
            counter.stock = entry.stock.name
            counter.token = entry.stock.token
            strategy.counter = entry.counter["_id"].toString()
            s.push(counter)
        }
        //assign trade according to that
        s.push(strategy)
    }
    stocks = Object.keys(stocks).map(s => {
        return {
            name: s,
            token: stocks[s]
        }
    })
    data = {
        strategies: s,
        stocks,
        dates
    }
    pyscript && pyscript.process_data('simulate_automation', data, (result, err) => {
        if (result) {
            str = "Simulation Started for dates " + JSON.stringify(data.dates)
            express.ws_write(str)
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
    data = {
        args: data
    }
     var s = [],
         t = [];
     //get all entries
     entries = await Entry.find({}).populate('strategy').populate('counter').populate('trade').populate('stock')
     //get the strategies associated with the entries
     //TODO CLEANUP change this method of data provider and come up with a clean way
     for (var entry of entries) {
         var strategy = entry.strategy.toJSON()
         strategy.status = entry.status
         strategy.trades = [entry.trade] //TODO important trades should be an array, change the database schema
         strategy.name = entry.strategy.name
         strategy.stock = entry.stock.name
         strategy.token = entry.stock.token
         //get the counter strategies
         if (entry.counter) {
             var counter = entry.counter.toJSON()
             counter.stock = entry.stock.name
             counter.token = entry.stock.token
             strategy.counter = entry.counter["_id"].toString()
             s.push(counter)
         }
         //assign trade according to that
         s.push(strategy)
     }
    data.strategies = s
    pyscript && pyscript.process_data('run_backtest', data, (result, err) => {
        if(err){
            res.send(err)
        } else {
            res.send(JSON.stringify(result))
            str = "Backtesting Finished for dates " + JSON.stringify(data.args)
            express.ws_write(str)
        }
    })
})

/* STOP AUTOMATION */
router.get('/stop_automation', function(req, res, next){
    pyscript && pyscript.process_data('stop_automation', {}, (result, err) => {
        express.ws_write("Stopped Automation")
        res.send(result)
        return;
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
        express.ws_write("Sent subscriptions: " + stocks.join(','))
        res.send(result)
        return;
    })
})

/* FORCE STOP PYTHON PROCESS */
router.get('/force_stop', function(req, res, next){
    pyscript && pyscript.process_data('force_stop', {}, (result, err) => {
        express.ws_write("Python Process has been force stopped")
        res.send(result)
        return;
    })
    !pyscript && process_not_started(res)
})

/* PYTHON SERVER NOTIFIES THAT THE PROCESS HAS BEEN STARTED */
router.get('/start_process', function(req, res, next){
    pyscript = {
        process_data
    }
    res.send('success')
})
router.post('/process', function(req, res, next){
    data = req.body;
    //process the data from python process
    res.send({status: 'success'})
})

function process_not_started(res) {
    express.ws_write("", "Process is not yet started. Start the python process first")
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
