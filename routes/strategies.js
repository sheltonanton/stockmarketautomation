const express = require('express');
const router = express.Router();
const Strategy = require('../models/strategy');

/* GET ALL STRATEGIES */
router.get('/', function(req, res, next){
    let query = req.query || {}
    Strategy.find(query, function(err, d){
        res_send(res, err, {strategies: d})
    })
})

/* POST A STRATEGY */
router.post('/', function(req, res, next){
    let data = req.body.strategy;
    Strategy.create(data).then((r,err) => {
        express.ws_write('SAVED STRATEGY: '+ data.name)
        res_send(res, err, d)
    })
})

/* DELETE A STRATEGY */
router.delete('/:id', function(req, res, next){
    let params = req.params;
    let id = params['id']
    Strategy.deleteOne({_id:id}, function(err, d){
        express.ws_write('', 'DELETED STRATEGY: ' + params['name'])
        res_send(res, err, d)
    })
})

/* PUT A STRATEGY */
router.put('/', function(req, res, next){
    let data = req.body.strategy;
    Strategy.updateOne({_id: data._id}, data, function(err,d){
        express.ws_write('UPDATED STRATEGY: ' + data['name'])
        res_send(res, err, d)
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