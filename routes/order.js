const express = require('express');
const router = express.Router();
const Order = require('../models/order')

/* TAKING AN ORDER */
router.post('/bo', function(req, res, next){
    let data = req.body['bo'];
    if(data['original']){
        response = express.zt.placeBO(data['stock'], data['type'], data['quantity'], 0.7, 1.0, data['entryPrice'])
    }
    console.log(data)
    Order.create(data).then((r, err) => {
        express.ws_write(data, null, 'orderCreated')
        res.send({
            status: 'success',
            data: r
        })
    })
})

/*GETTING ALL ORDERS*/
router.get('/bo', function(req, res, next){
    let data = req.body;
    let filter = data['filter'] || {}
    Order.find(filter, (err, d)=> {
        if(err){
            res.send({
                status: "error",
                data: err
            })
        }else{
            res.send({
                status: "success",
                data:d
            })
        }
    })
})

/* UPDATING ORDER */
router.put('/bo', function(req, res, next){
    let data = req.body['bo'];
    Order.updateOne({_id: data._id}, {$set:data}, (err, d) => {
        if(err){
            express.ws_wirte("Order "+data._id+": updated")
            express.ws_write(d, null, 'orderUpdated')
            res.send({
                status: "error",
                data: err
            })
        }else{
            res.send({
                status: "success",
                data:d
            })
        }
    })
})

module.exports = router