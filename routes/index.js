const express = require('express');
const event = require('./events');
const {getTrader} = require('../zerodha_orders');
var router = express.Router();

const Property = require('../models/property')
// const Entry = require('../models/entry')

const login = require('../views/data/forms/login')
const addUser = require('../views/data/forms/addUser')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    login,addUser
  });
});

router.get('/backtest', function(req, res, next){
  res.render('backtest', {})
});

router.get('/properties/:property', function(req, res, next){
  params = req.params;
  property = params['property']
  property && Property.findOne({key: property}, function(err, d){
    if(err){
      res.send({
        status: 'error',
        error: err
      })
    }else{
      res.send({
        status: 'success',
        property: d
      })
    }
  })
})

function postProperty(data, req, res){
  Property.insertMany(data, function(err, docs){
    if(err){
      res.send({
        status: 'error',
        error: err
      })
    }else{
      res.send({
        status: 'success',
        data: docs
      })
    }
  })
}
router.post('/properties', function(req, res, next){
  data = req.body;
  data && postProperty(data.properties, req, res)
})
router.post('/property', function(req, res, next){
  data = req.body;
  data && postProperty([data.property], req, res)
})
router.put('/property', function(req, res, next){
  data = req.body.property;
  data && Property.updateOne({key: data.key},{$set:data}, function(err, docs){
    if(err){
      res.send({
        status: 'error',
        error: err
      })
    }else{
      res.send({
        status: 'success',
        data: docs
      })
    }
  })
})

router.post('/zerodha', async function(req, res, next) {
  (async function(){
    let {
      userid,
      password,
      pin = null
    } = req.body
    try{
      let trader = await getTrader();
      let response = await trader.login(userid, password, pin);
      console.log(response);
      event.notifications.push("Logged in successfully")
      res.send({status: "success"})
    }catch(ex){
      console.log(ex);
      res.send({status: "error", error: ex})
    }
  }())
})

router.get('/zerodha/isloggedin', async function (req, res, next) {
  let trader = await getTrader();
  let response = trader.isLoggedIn();
  if (response != null) {
    res.send({
      status: 'success',
      loggedin: true
    })
  } else {
    res.send({
      status: 'success',
      loggedin: false
    })
  }
})

module.exports = router;