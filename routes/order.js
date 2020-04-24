const express = require('express');
const linereader = require('line-reader');

const router = express.Router();
const {getTrader, getUsers} = require('../zerodha_orders');

//need to create a middleware which handles the response and transfer the required data to the requester
//create a singleton object and fetch it
/* BRACKET ORDER */
router.post('/bo', async function(req, res, next){
    let data = req.body['bo'];
    if(data['original']){
        //TODO this should be replaced with external api call for microservice implementation
        trader = await getTrader();
        response = await trader.placeBO(data['stock'], data['type'], data['quantity'], data['target'], data['stoploss'], data['price'])
        res.send(createResponse(response));
    }
})

/* DELETE BRACKET ORDER */
router.delete('/bo/:order_id', async function (req, res, next) {
    let params = req.body
    if (params['original']) {
        trader = await getTrader();
        response = await trader.deleteBO(params)
        res.send(createResponse(response));
    }
})

/* COVER ORDER */
router.post('/co', async function (req, res, next) {
    let data = req.body['co']
    if (data['original']) {
        [master, traders] = await getUsers();
        var quantity = stocks_on_userid[master.user_id][data['stock']];
        response = await master.placeCO(data['stock'], data['type'], quantity, data['trigger_price'], data['price'])
        res.send(createResponse(response));
        if(response.status == 'success'){
            orders[response.data.order_id] = [];
            for (var trader in traders) {
                console.log(trader.user_id);
                quantity = stocks_on_userid[trader.user_id][data['stock']];
                res = await trader.placeCO(data['stock'], data['type'], data['type'], quantity, data['trigger_price'], data['price'])
                if (res.status == 'success') {
                    orders[response.data.order_id].push({
                        [trader.user_id]: res.data.order_id
                    });
                }
                console.log(res);
            }
        }
    }
})

/* DELETE COVER ORDER */
router.delete('/co/:order_id', async function (req, res, next) {
    let params = req.body
    if (params['original']) {
        var [master, traders] = await getUsers();
        var response = await master.deleteCO(params)
        res.send(createResponse(response));
        const master_order_id = params['order_id'];
        if (response.status == 'success' && orders[master_order_id]) {
            master_map = orders[master_order_id];
            for (var trader in traders) {
                params['order_id'] = master_map[trader.user_id];
                res = await trader.deleteCO(params)
                if(res.status == 'success'){
                    delete master_map[trader.user_id];
                }
                console.log(res);
            }
        }
        delete orders[master_order_id];
    }
})

/* LIMIT ORDER */
router.post('/regular', async function(req, res, next){
    let data = req.body['regular']
    if(data['original']){
        trader = await getTrader();
        response = await trader.placeLimit(data['stock'], data['type'], data['quantity'], data['price'])
        res.send(createResponse(response));
    }
})

function createResponse(response){
    //if the returned response is null, return if possible with order_id
    return response;
}

const stocks_on_userid = {}
var first_line = true;
var userids = []
const orders = {}

linereader.eachLine('stocks.csv', (line, last, cb) => {
    d = line.split(',');
    if(first_line){
        first_line = false;
        userids = d;
        for(var i=1; i < d.length; i++){
            stocks_on_userid[userids[i]] = {}
        }
    }else{
        for (var i = 1; i < d.length; i++) {
            stocks_on_userid[userids[i]][d[0]] = parseInt(d[i]);
        }
    }
    if(last){
        cb(false);
    }else{
        cb();
    }
})

module.exports = router;
//{userId: {stocks: quantity}}