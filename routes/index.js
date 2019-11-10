const express = require('express');
var router = express.Router();

const Stock = require('../models/stock')
const Property = require('../models/property')
const User = require('../models/user')

const login = require('../views/data/forms/login')
const addUser = require('../views/data/forms/addUser')

const {Zerodha} = require('../zerodha_orders')
var z = null

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    login,addUser
  });
});
router.get('/home', function(req, res, next){
  res.render('home.html', {})
})

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

router.post('/zerodha', function(req, res, next) {
  (async function(){
    let {
      userid,
      password,
      pin = null
    } = req.body
    try{
      z_login(userid, password, pin)
      express.ws_write("Logged in successfully")
      res.send({status: "success"})
    }catch(ex){
      console.log(ex);
      res.send({status: "error", error: ex})
    }
  }())
})

router.get('/zerodha/isloggedin', function (req, res, next) {
  if (z != null) {
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

router.post('/zerodha/bo', function(req, res, next){
  if(z != null){
    let data = req.body;
    let {
      tradingsymbol,
      transaction_type,
      quantity,
      squareoff,
      stoploss,
      price
    } = data
    response = z.placeBO(tradingsymbol, transaction_type, quantity, squareoff, stoploss, price)
    console.log(response)
    res.send({
      status: 'success',
      data: {
        z_res: response
      }
    })
  }else{
    res.send({
      status: 'error',
      error: 'Zerodha not yet logged in'
    })
  }
})

router.post('/stocks', function(req, res, next){
  var data = req.body;
  if(data.stock){
    data = {
      name: data.stock
    }
    Stock.create(data).then(function (d, err) {
      if (err) throw new Error(err)
      express.ws_write("Saved stock: "+ data.name)
      res.send({
        status: "success",
        data: d
      })
    }) //saving stocks to Stock collection
  }else if(data.stocks){
    res.send({
      status: "construction",
      data
    })
  }
})

router.get('/stocks', function(req, res, next){
  Stock.find({}, function(err, d){
    if(err) throw new Error(err)
    res.send({stocks: d, status: 'success'});
  })
})
router.delete('/stocks', function(req, res, next){
  let params = req.query;
  if(params['name']){
    Stock.deleteOne({name: params['name']}, function(err, d){
      if(err) throw new Error(err)
      express.ws_write("", "Deleted stock: "+params['name'])
      res.send({stocks: d, status: 'success'})
    })
  }
});

module.exports = router;

//checking autologin
async function z_login(userid, password, pin){
  zt = new Zerodha(userid, password, pin)
  await zt.connect();
  // await zt.onScriptsLoaded(true);
  response = await zt.login(); //login
  let {
    user_id,
    request_id
  } = response.data;
  response = await zt.tfa(user_id, request_id); //two factor authentication
  z = zt;
  express.zt = zt
}

Property.findOne({
  key: 'autoLogin'
}, function (err, d) {
  if (d.value == "true") {
    User.findOne({master: true}, async function(err, d){
      try{
        await z_login(d.userId, d.password, d.pin)
        express.ws_write(d.userId, null, "loggedIn")
      }catch(ex){
        console.error("Network Connection Error")
        express.ws_write("", "Network Connection Error")
      }
    })
  }
})