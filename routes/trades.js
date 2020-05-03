const express = require('express');
const event = require('./events');
const router = express.Router();
const Trade = require('../models/trade')

/* GET ALL TRADES */
router.get('/', function(req, res, next){
    let query = req.query || {}
    Trade.find(query, function (err, d) {
        res_send(res, err, {
            trades: d
        })
    })
})

/* GET SINGLE TRADE */
router.get('/:id', function (req, res, next) {
    let query = {
        _id: req.params['id']
    }
    Trade.find(query, function (err, d) {
        res_send(res, err, {
            trade: d[0]
        })
    })
})

/* POST A TRADE */
router.post('/', function (req, res, next) {
    let data = req.body.trade;
    Trade.create(data).then((r, err) => {
        event.notifications.push('SAVED TRADE: ' + data.name)
        if(! err){
            res.send({
                trade: r
            })
        }
    })
})

/* DELETE A TRADE */
router.delete('/:id', function (req, res, next) {
    let params = req.params;
    let id = params['id']
    Trade.deleteOne({
        _id: id
    }, function (err, d) {
        event.notifications.push('', 'DELETED TRADE: ' + params['name'])
        res_send(res, err, d)
    })
})

/* PUT A TRADE */
router.put('/:id', function (req, res, next) {
    let id = req.params['id']
    let data = req.body.trade;
    Trade.updateOne({
        _id: id
    }, data, function (err, d) {
        event.notifications.push('UPDATED TRADE: ' + data['name'])
        if(!err) res.send({trade: req.body.trade})
    })
})

function res_send(res, err, d) {
    if (err) {
        res.send({
            status: 'error',
            data: err
        })
    } else {
        res.send({
            status: 'success',
            ...d
        })
    }
}

module.exports = router;