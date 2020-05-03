const express = require('express');
const event = require('./events');
const router = express.Router();
const Strategy = require('../models/strategy');

/* GET ALL STRATEGIES */
router.get('/', function(req, res, next){
    let query = req.query || {}
    query.name = new RegExp(query.name)
    Strategy.find(query, function(err, d){
        res_send(res, err, {strategies: d})
    })
})

/*GET A PARTICULAR STRATEGY */
router.get('/:id', function(req, res, next){
    let query = {_id: req.params['id']}
    Strategy.find(query, function(err, d){
        res_send(res, err, {strategy: d[0]})
    })
})

/* POST A STRATEGY */
router.post('/', function(req, res, next){
    let data = req.body.strategy;
    Strategy.create(data).then((r,err) => {
        event.notifications.push('SAVED STRATEGY: '+ data.name)
        if(!err){
            res.send({
                strategy: r
            })
        }
    })
})

/* DELETE A STRATEGY */
router.delete('/:id', function(req, res, next){
    let params = req.params;
    let id = params['id']
    Strategy.deleteOne({_id:id}, function(err, d){
        event.notifications.push('', 'DELETED STRATEGY: ' + params['name'])
        if (!err) {
            res.send({
                strategy: {
                    _id: id
                }
            })
        }
    })
})

/* PUT A STRATEGY */
router.put('/:id', function(req, res, next){
    let id = req.params['id']
    let data = req.body.strategy;
    Strategy.updateOne({_id: id}, data, function(err,d){
        event.notifications.push('UPDATED STRATEGY: ' + data['name'])
        res_send(res, err, {strategy: d})
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