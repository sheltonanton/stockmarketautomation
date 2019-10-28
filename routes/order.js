const express = require('express');
const router = express.Router();
const Order = require('../models/order')

/* TAKING AN ORDER */
router.post('/bo', function(req, res, next){
    let data = req.body['bo'];
    if(data['original']){
        response = express.zt.placeBO(data['stock'], data['type'], data['quantity'], 0.7, 1.0, data['price'])
    }
    console.log(data)
    data['entryPrice'] = data['price']
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


/* EXITING AN ORDER */
router.delete('/bo', function(req, res, next){
    let data = req.body['bo'];
    //deleting the zerodha order
})
/* LIMIT ORDER */
router.post('/regular', function(req, res, next){
    let data = req.body['regular']
    console.log(data)
})


module.exports = router