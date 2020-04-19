const jsdom = require('jsdom')

const {JSDOM} = jsdom
const KITE_HOME = 'http://kite.zerodha.com'
const LOGIN = '/api/login'
const TFA = '/api/twofa'
const BRACKET_ORDER = 'oms/orders/bo'
const LIMIT_ORDER = 'oms/orders/regular'
const COVER_ORDER = 'oms/orders/co'

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
        return this.window
    }
    
    async function login(user_id, password){
        var data = {user_id:this.user_id,password:this.password}
        response = await this.fetch(LOGIN, {method: "POST",headers:{...URL_ENCODED}, body: url_encode(data)})
        return response
    }
    
    async function tfa(user_id, request_id, twofa_value){
        var data = {user_id, request_id, twofa_value:this.twofa_value}
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
        console.log(data)
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

    // async function getChart(token, type, from, to){
    //   this.fetch("https://kite.zerodha.com/oms/instruments/historical/2714625/15minute?user_id=IV8690&oi=1&from=2020-02-03&to=2020-02-19&ciqrandom=1582109593327", { "accept": "*/*", "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,da;q=0.7", "authorization": "enctoken +LpGWbIvw/Gq9QRe+MEfXTzlTGzeaGFvwAstYS44wq/8ao4mwyW+HPgmGOl+Sp4u7cw9Dzaz5aiFTPPiqj5mkmWpvmRybg==", "cache-control": "no-cache", "pragma": "no-cache", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin" }, "referrer": "https://kite.zerodha.com/static/build/chart.html?v=2.4.0", "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" });
    // }
    
    function getAuth(){
        let cookies = this.window.document.cookie.split('; ');
        let authorization = cookies.filter(cookie => cookie.includes('enctoken'))[0];
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
                reject({err: this.status, response:req.response})
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
}
catch(ex){console.log(ex);}
}());

module.exports = {
  Zerodha
}

//getStatus - finding the connection status for every HEARTBEAT time
//reconnect - reconnect if not connected, do that while placing the order and for every HEARTBEAT time
//