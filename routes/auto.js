const express = require('express');
const axios = require('axios');
const router = express.Router();
const Strategy = require('../models/strategy')
const Trade = require('../models/trade')
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
    express.ws_write("Starting Automation")
        s = await Strategy.find({})
        t = await Trade.find({})
        a = {},t.forEach(b => {a[b._id] = b})
        s.forEach(d => {d.trades = d.trades.map(c => {return a[c]})})
        data = {strategies: s}
        pyscript && pyscript.process_data('start_automation', data, (result, err) => {
            express.ws_write("Started Automation")
            res.send(result)
            return;
        })
        !pyscript && process_not_started(res);
})

/* RUN AUTOMATION AS SIMULATION */
router.post('/simulate', async function(req, res, next){
    let data = req.body.data
    data = {
        dates: data
    }
    s = await Strategy.find({})
    t = await Trade.find({})
    a = {},t.forEach(b => {a[b._id] = b})
    s.forEach(d => {d.trades = d.trades.map(c => {return a[c]})})
    data.strategies = s
    pyscript && pyscript.process_data('simulate_automation', data, (result, err) => {
        if (err) {
            res.send(error)
        } else {
            str = "Simulation Started for dates " + JSON.stringify(data.dates)
            express.ws_write(str)
            res.send(result)
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
        callback(res.data)
    }).catch(err => {
        callback(null, err)
    })
}

pyscript = {process_data} //TODO temporary, need to replace with something robust

module.exports = router;
