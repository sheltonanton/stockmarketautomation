const express = require('express');
const event = require('./events');
const router = express.Router();
const User = require('../models/user')
const {saveTrader, saveMaster} = require('../zerodha_orders')

/* GET USERS */
router.get('/', function(req, res, next) {
  let query = req.query || {};
  User.find(query, {'password': 0, 'pin': 0}, function(err, d){
    for(var a of d){
      delete a['password'];
    }
    res_send(res, err, {users: d})
  })
});

/*GET USER*/
router.get('/:userId', function(req, res, next){
  let params = req.params;
  let userId = params['userId']
  User.findOne({userId}, function(err, d){
    res_send(res, err, d)
  })
})

/*POST USER*/
router.post('/', function(req, res, next){
  let data = req.body;
  User.create(data.user).then((r,err) => {
    !err && saveTrader(data.user);
    event.notifications.push('SAVED USER: '+data.user.userId)
    res_send(res, err, r)
  })
})

/*DELETE USER*/
router.delete('/:userId', function(req, res, next){
  let params = req.params;
  let userId = params['userId']
  User.deleteOne({userId}, function(err, d){
    event.notifications.push("",'DELETED USER: ' + userId)
    res_send(res, err, d)
  })
})

/*UPDATE USER*/
router.put('/', function(req, res, next){
  let data = req.body.user;
  User.updateOne({userId: data.userId}, data, function(err, d){
    event.notifications.push('UPDATED USER: ' + data.userId)
    res_send(res, err,d)
  })
})

/*UPDATE MASTER*/
router.put('/master/:userId', function(req, res, next){
  let params = req.params;
  let userId = params.userId;
  User.updateOne({master: true}, {$set: {master: false}}, function(err, d){
    User.updateOne({userId}, {$set: {master: true}}, function(err, d){
      event.notifications.push('UPDATED MASTER: ' + userId);
      //swap master and previous master'
      saveMaster(userId);
      res_send(res, err, d);
    })
    err && res_send(res, err, d)
  })
})

function res_send(res, err, d){
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
