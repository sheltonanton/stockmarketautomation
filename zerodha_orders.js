const jsdom = require('jsdom');
const User = require('./models/user');

const {JSDOM} = jsdom
const KITE_HOME = 'http://kite.zerodha.com'
const LOGIN = '/api/login'
const TFA = '/api/twofa'
const BRACKET_ORDER = 'oms/orders/bo'
const LIMIT_ORDER = 'oms/orders/regular'
const COVER_ORDER = 'oms/orders/co'
const PROFILE = 'user/profile'

const URL_ENCODED = { 'Content-Type': 'application/x-www-form-urlencoded' }
const BO_JSON = {quantity:0, price:0, stoploss:0, trailing_stoploss:0, 
                exchange: "NSE",tradingsymbol: "",transaction_type: "",order_type: "LIMIT", product: "MIS",validity: "DAY",disclosed_quantity:0,
                trigger_price: 0, squareoff:1,variety:"bo",user_id:""}

const LI_JSON = {
                  quantity:0, price:0, stoploss:0, trailing_stoploss:0,
                  exchange: "NSE", tradingsymbol:"", transaction_type:"", order_type: "LIMIT",
                  product: "MIS", trigger_price:0, squareoff:0, variety:"regular", user_id:""
                }

const CO_JSON = {quantity:0, price:0, stoploss:0, trailing_stoploss:0,
                  exchange: "NSE", tradingsymbol: "", transaction_type: "", order_type:"LIMIT", product: "MIS", validity: "DAY",
                  disclosed_quantity:0, trigger_price:0, squareoff:0, stoploss:0, trailing_stoploss:0,
                  variety: "co", user_id: ""}



const store = (new(function Store() {
  Store.prototype.set = async function(name, trader){
    this[name] = trader;
    await trader.connect();
  }
  Store.prototype.get = async function(name){
    trader = this[name];
    if(trader == null){
      return null;
    }
    response = trader.isLoggedIn();
    if(response == null){
      await trader.login();
    }
    return trader;
  }
}));

async function getMaster(){
  let master = await store.get('master');
  if(master == null){
    let user = await User.findOne({
      master: true
    });
    master = new Zerodha(user.userId, user.password, user.pin);
    await store.set('master', master);
  }
  console.log("Getting auth from master: " + master.user_id);
  return master;
}
getMaster()

async function getTrader(user_id){
  if(user_id == null){
    return await getMaster();
  }
  let zerodha = await store.get(user_id);
  if(zerodha == null){
    let user = await User.findOne({userId: user_id});
    zerodha = new Zerodha(user.userId, user.parssword, user.pin);
    await store.set(user_id, zerodha);
  }
  return zerodha;
}

async function getUsers(){
  let users = await User.find({});
  let traders = []
  let master = null;
  for(var user of users){
    if(!user.master){
      traders.push(await getTrader(user.userId));
    }else{
      master = await getMaster();
    }
  }
  return [master, traders];
}

function Zerodha(user_id, password, twofa_value){
    this.user_id = user_id
    this.password = password
    this.twofa_value = twofa_value
}

(function(){
try{
    async function connect(){
        var promise = JSDOM.fromURL(KITE_HOME, {
            refererer: KITE_HOME,
            includeNodeLocations: true,
            storageQuota: 10000000,
            pretendToBeVisual: true, //jsdom acts to pretend as a visual browser
            //security violations - can give access to node js environment and hence inside the computer
            runScripts: "dangerously", //for executing scripts inside <script> tag
            resources: "usable" //for executing external scripts
        })
        var dom = await promise;
        this.dom = dom;
        this.window = dom.window;
        this.window.fetch = this.fetch.bind(this.window)
        await this.login();
        this.connected = true;
        return this.window
    }
    
    async function login(){
        var data = {user_id:this.user_id,password:this.password}
        response = await this.fetch(LOGIN, {method: "POST",headers:{...URL_ENCODED}, body: url_encode(data)})
        if(response.status == 'success'){
          response = await this.tfa(response.data.request_id);
          response.status == 'success' && console.log("Logged in to " + this.user_id);
        }
        return response
    }

    async function isLoggedIn(){
      if(!this.connected) return null;
      var response = await this.fetch(PROFILE, {method: "GET", header:{authorization: this.getAuth(), ...URL_ENCODED}});
      console.log(response);
      if(response.status == 'success'){
        return response;
      }
      return null;
    }
    
  async function tfa(request_id){
        var data = {user_id: this.user_id, request_id, twofa_value:this.twofa_value}
        response = await this.fetch(TFA, {method: "POST",headers:{...URL_ENCODED}, body: url_encode(data)})
        return response
    }
    
    async function placeBO(tradingsymbol, transaction_type, quantity, squareoff, stoploss, price){
        transaction_type = transaction_type.toUpperCase()
        tradingsymbol = tradingsymbol.toUpperCase()
        price = parseFloat(Math.round(price * 100)/100)
        quantity = parseInt(quantity)
        try {
            var data = {tradingsymbol, transaction_type, quantity, price, squareoff, stoploss}
            data.order_type = "LIMIT"
            if(!price) data.order_type = "MARKET"
            data = {
                ...BO_JSON,
                ...data
            }
            response = await this.fetch(BRACKET_ORDER, {method: "POST", headers: {authorization: this.getAuth(), ...URL_ENCODED}, body: url_encode(data)})
            return response
        }catch(err){
            console.log(err)
        }
    }

    async function placeCO(tradingsymbol, transaction_type, quantity, trigger_price, price){
      transaction_type = transaction_type.toUpperCase()
      tradingsymbol = tradingsymbol.toUpperCase()
      price = parseFloat(price)
      quantity = parseInt(quantity)
      trigger_price = parseFloat(trigger_price)
      try {
        var data = {...CO_JSON, tradingsymbol, transaction_type, quantity, trigger_price, price}
        if(!price) data.order_type = "MARKET"
        data['user_id'] = this.user_id;
        console.log(data);
        response = await this.fetch(COVER_ORDER, {method: "POST", headers: {authorization: this.getAuth(), ...URL_ENCODED}, body: url_encode(data)})
        return response
      }catch(err){
        console.log(err)
      }
    }

    async function deleteCO(params){
      try{
        response = await this.fetch(COVER_ORDER+'/'+params['order_id']+'?parent_order_id='+params['order_id']+'&variety='+params['variety'], {method: "DELETE", headers: {authorization: this.getAuth()}})
        return response
      }catch(err){
        console.log(err)
      }
    }

    async function deleteBO(params){
      try{
        response = await this.fetch(BRACKET_ORDER+'/'+params['order_id']+'?parent_order_id='+params['order_id']+'&variety='+params['variety'], {method: "DELETE", headers: {authorization: this.getAuth()}})
        return response
      }catch(err){
        console.log(err)
      }
    }

    async function placeLimit(tradingsymbol, transaction_type, quantity, price){
      try{
        var data = {tradingsymbol, transaction_type, quantity, price}
        data = {
          ...LI_JSON,
          ...data
        }
        response = await this.fetch(LIMIT_ORDER, {method: "POST", headers: {authorization: this.getAuth(), ...URL_ENCODED}, body: url_encode(data)})
        return response
      }catch(err){
        console.log(err)
      }
    }

    async function getHistorical(instrumentToken, fromDate, toDate) {
      try{
        var to = new Date(toDate);
        var from = new Date(to - (21 * 24 * 60 * 60 * 1000));
        const beginning = new Date(fromDate);
        var ticks = [];
        var status = 'success';
        while (true) {
          var flag = false;
          if (from <= beginning){
            flag = true;
            from = beginning;
          }
          var tick = await this.window.fetch(`https://kite.zerodha.com/oms/instruments/historical/${instrumentToken}/minute?user_id=IV8690&oi=1&from=${from.yyyymmdd()}&to=${to.yyyymmdd()}`, {
            "headers": {
              "authorization": this.getAuth(),
              "cache-control": "no-cache",
              "pragma": "no-cache",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin"
            },
            "referrer": "https://kite.zerodha.com/static/build/chart.html?v=2.4.0",
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": null,
            "method": "GET",
            "mode": "cors"
          });
          to = new Date(from - (24 * 60 * 60 * 1000));
          from = new Date(to - (21 * 24 * 60 * 60 * 1000));
          if(tick.status != 'success'){
            status = tick.status;
            ticks = tick[Object.keys(tick)[1]];
            break;
          }
          ticks = tick.data.candles.concat(ticks);
          if(flag) break;
        }
        status == 'error' && console.log(ticks);
        return {
          status,
          data: ticks
        }
      }catch(err){
        console.log(err);
        return {'status': 'error', 'error': err};
      }
    }
    // async function getChart(token, type, from, to){
    //   this.fetch("https://kite.zerodha.com/oms/instruments/historical/2714625/15minute?user_id=IV8690&oi=1&from=2020-02-03&to=2020-02-19&ciqrandom=1582109593327", { "accept": "*/*", "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,da;q=0.7", "authorization": "enctoken +LpGWbIvw/Gq9QRe+MEfXTzlTGzeaGFvwAstYS44wq/8ao4mwyW+HPgmGOl+Sp4u7cw9Dzaz5aiFTPPiqj5mkmWpvmRybg==", "cache-control": "no-cache", "pragma": "no-cache", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin" }, "referrer": "https://kite.zerodha.com/static/build/chart.html?v=2.4.0", "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" });
    // }
    
    function getAuth(){
        let cookies = this.window.document.cookie.split('; ');
        let authorization = (cookies.filter(cookie => cookie.includes('enctoken')))[0];
        authorization = authorization || "";
        authorization = authorization.replace('=', ' ')
        return authorization
    }
    
    //wait for other scripts to be loaded asynchronously
    async function onScriptsLoaded(recur){
      var pending = false
      scripts = Array.from(this.window.document.getElementsByTagName('script'))
      //promise array which resolves only on all scripts are loaded
      promiseArray = scripts.map(script => {
        return new Promise(function(resolve, reject){
          if(script.isLoaded == undefined){
            pending = true
            let data = {script,resolved: true}
            script.onload = () => {resolve(data);script.isLoaded = true}
          }else{
            let data = {script,resolved: true}
            resolve(data);
          }
        })
      })
      let result = await Promise.all(promiseArray);
      if(pending && recur) {
        await this.onScriptsLoaded(pending && recur)
      }
      return result;
    }
    
    /*utility functions*/
    function url_encode(data){
        return new URLSearchParams(data).toString()
    }
    
    function fetch(url, options){
      promise = new Promise((resolve, reject) => {
        req = new this.window.XMLHttpRequest()
        req.onreadystatechange = function() {
          if (this.readyState == 4) {
            if(this.status == 200){
                try{
                    resolve(req.response && JSON.parse(req.response))
                }catch(err){
                    reject({err, response: req.response})
                }
            }else{
                var res = JSON.parse(req.response);
                res.error = this.status;
                resolve(res);
            }
          }
        };
        req.open(options.method, url)
        Object.keys(options.headers || {}).forEach(key => {
          req.setRequestHeader(key, options.headers[key])
        })
        if(options.body) req.send(options.body); else req.send();
      })
      return promise;
    }
    //Zerodha functions here
    Zerodha.prototype.connect         = connect
    Zerodha.prototype.login           = login
    Zerodha.prototype.isLoggedIn      = isLoggedIn
    Zerodha.prototype.tfa             = tfa
    Zerodha.prototype.placeBO         = placeBO
    Zerodha.prototype.placeCO         = placeCO
    Zerodha.prototype.deleteBO        = deleteBO
    Zerodha.prototype.deleteCO        = deleteCO
    Zerodha.prototype.placeLimit      = placeLimit
    Zerodha.prototype.getAuth         = getAuth
    Zerodha.prototype.onScriptsLoaded = onScriptsLoaded
    Zerodha.prototype.url_encode      = url_encode
    Zerodha.prototype.fetch           = fetch
    Zerodha.prototype.getHistorical   = getHistorical
}
catch(ex){console.log(ex);}
}());

module.exports = {
  getTrader,
  getUsers
}

//getStatus - finding the connection status for every HEARTBEAT time
//reconnect - reconnect if not connected, do that while placing the order and for every HEARTBEAT time

Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
  ].join('-');
};
