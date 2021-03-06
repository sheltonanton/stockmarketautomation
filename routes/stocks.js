const express = require('express');
const event = require('./events');
const router = express.Router();
const Stock = require('../models/stock')
const Entry = require('../models/entry')

/* GET STOCKS QUERYPARAM */
router.get('/', function (req, res, next) {
    let query = req.query || {}
    query.name = new RegExp(query.name)
    Stock.find(query).sort({name: 1}).then((d) => {
        console.log(d)
        res.send({
            stocks: d
        });
    })
})
/* GET STOCKS PATHPARAM */
router.get('/:pathParam', function (req, res, next) {
    var param = req.params['pathParam']
    var stocks = {}
    if (param == 'active') {
        Entry.find({}).populate('stocks').exec(function (err, d) {
            if (err) throw new Error(err)
            for (var a of d) {
                for(var b of a['stocks']){
                    stocks[b['name']] = b['token'] //populating with the stocks to be subsribed for live data feed
                }
            }
            s = []
            for (var name in stocks) {
                s.push({
                    name,
                    token: stocks[name]
                })
            }
            res.send({
                stocks: s,
                status: 'success'
            })
        })
    }else{
        let query = {
            _id: param
        }
        Stock.find(query, function (err, d) {
            if (!err) {
                res.send({
                    stock: d[0]
                })
            }
        })
    }
})

router.post('/', function (req, res, next) {
    var data = req.body;
    if (data.stock) {
        data = {
            name: data.stock
        }
        Stock.create(data).then(function (d, err) {
            if (err) throw new Error(err)
            event.notifications.push("Saved stock: " + data.name)
            res.send({
                status: "success",
                data: d
            })
        }) //saving stocks to Stock collection
    } else if (data.stocks) {
        res.send({
            status: "construction",
            data
        })
    }
})

router.delete('/', function (req, res, next) {
    let params = req.query;
    if (params['name']) {
        Stock.deleteOne({
            name: params['name']
        }, function (err, d) {
            if (err) throw new Error(err)
            event.notifications.push("", "Deleted stock: " + params['name'])
            res.send({
                stocks: d,
                status: 'success'
            })
        })
    }
});

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