const express = require('express');
const router = express.Router();
const Order = require('../models/order')

var orderId = 0
/* TAKING AN ORDER */
router.post('/bo', async function(req, res, next){
    let data = req.body['bo'];
    if(data['original']){
        console.log(data)
        response = await express.zt.placeBO(data['stock'], data['type'], data['quantity'], data['target'], data['stoploss'], data['price'])
        res.send({
            status: 'success',
             data: {
                 '_id': response.data.order_id
             }
        })
    }else{
        data['entryPrice'] = data['price']
        Order.create(data).then((r, err) => {
            express.ws_write(data, null, 'orderCreated')
            res.send({
                status: 'success',
                data: r
            })
        })
    }
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
router.delete('/bo', async function(req, res, next){
    let params = req.body
    console.log(params)
    if(params['original']){
        response = await express.zt.deleteBO(params)
        console.log(response)
        res.send({
            'status': 'success',
            data: {
                '_id': params['order_id']
            }
        })
    }else{
        //TODO remove the below codes
        let {
            exitTime, exitPrice
        } = params
        await Order.updateOne({orderId: params['order_id']}, {$set:{exitTime, exitPrice}})
        res.send({
            'status': 'success',
            data: {
                '_id': params['order_id']
            }
        })
    }
})
/* LIMIT ORDER */
router.post('/regular', function(req, res, next){
    let data = req.body['regular']
    if(data['original']){
        console.log("Original trade to be executed")
    }else{
        console.log("Not original edit")
    }
    console.log(data)
})

/* COVER ORDER */
router.post('/co', async function(req, res, next){
    let data = req.body['co']
    if(data['original']){
        console.log(data)
        response = await express.zt.placeCO(data['stock'], data['type'], data['quantity'], data['trigger_price'], data['price'])
        res.send({
            status: 'success',
            data: {
                '_id': response.data.order_id
            }
        })
    }else{
        //TODO Remove below codes
        let {
            stock, quantity, type, entryTime, entryPrice
        } = data
        r = await Order.create({orderId: orderId, stock, quantity, type, entryTime, entryPrice})
        res.send({
            status: 'success',
            data: {
                '_id': orderId
            }
        })
        orderId = orderId + 1
    }
})
/* DELETE COVER ORDER */
router.delete('/co', async function(req, res, next){
    let params = req.body
    console.log(params)
    if(params['original']){
        response = await express.zt.deleteCO(params)
        console.log(response)
        res.send({
            'status': 'success',
            data: {
                '_id': params['order_id']
            }
        })
    }else{
        //TODO remove the below codes
        let {
            exitTime, exitPrice
        } = params
        await Order.updateOne({orderId: params['order_id']}, {$set:{exitTime, exitPrice}})
        res.send({
            'status': 'success',
            data: {
                '_id': params['order_id']
            }
        })
    }
})


module.exports = router