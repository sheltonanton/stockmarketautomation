const jsdom = require('jsdom')
const express = require('express')
CHARTINK_HOME = "https://chartink.com"
const {
    JSDOM
} = jsdom
const Zerodha = require('./zerodha_orders')
zt = new Zerodha('RF5775', 'praveena', '270796')
(async function(){
    await zt.connect();
    response = await zt.login();
    let {
        user_id,
        request_id
    } = response.data;
    response = await zt.tfa(user_id, request_id); //two factor authentication
    
}())

express()
    .use(express.json())
    .post('/chartink',)

// function fetch(url, options) {
//     promise = new Promise((resolve, reject) => {
//         req = new this.window.XMLHttpRequest()
//         req.onreadystatechange = function () {
//             if (this.readyState == 4) {
//                 if (this.status == 200) {
//                     try {
//                         resolve(req.response && JSON.parse(req.response))
//                     } catch (err) {
//                         reject({
//                             err,
//                             response: req.response
//                         })
//                     }
//                 } else {
//                     reject({
//                         err: this.status,
//                         response: req.response
//                     })
//                 }
//             }
//         };
//         req.open(options.method, url)
//         Object.keys(options.headers || {}).forEach(key => {
//             req.setRequestHeader(key, options.headers[key])
//         })
//         if (options.body) req.send(options.body);
//         else req.send();
//     })
//     return promise;
// }

// (async function(){
//     var promise = JSDOM.fromURL(CHARTINK_HOME+'/scan_dashboard', {
//         refererer: CHARTINK_HOME,
//         includeNodeLocations: true,
//         storageQuota: 10000000,
//         pretendToBeVisual: true, //jsdom acts to pretend as a visual browser
//         //security violations - can give access to node js environment and hence inside the computer
//         runScripts: "dangerously", //for executing scripts inside <script> tag
//         resources: "usable" //for executing external scripts
//     })
//     var dom = await promise
//     dom.window.fetch = fetch.bind(dom.window)
//     console.log("DOM Initialized")
//     setTimeout(function(){
//         dom.window.onload = function(){
//             dom.window.document.body.onload = async function(){
//                 token = dom.window.document.getElementsByName('_token')[0].value
//                 try{
//                     await dom.window.fetch(CHARTINK_HOME+'/login', {
//                         method: "POST",
//                         headers: {
//                             ['Content-Type']: 'application/x-www-form-urlencoded'
//                         },
//                         body: new URLSearchParams({
//                             _token: token,
//                             email: "gopalmadison@gmail.com",
//                             password: "PRAVEENA",
//                             remember: 'on'
//                         }).toString()
//                     })
//                     // dom.window.document.getElementById("email").value = "gopalmadison@gmail.com"
//                     // dom.window.document.getElementById("password").value = "PRAVEENA"
//                     // dom.window.document.forms[0].dispatchEvent(new Event('submit'))
//                 }catch(ex){
//                     var ndom;
//                     try{
//                         ndom = new JSDOM(ex.response, {
//                         refererer: CHARTINK_HOME,
//                         includeNodeLocations: true,
//                         storageQuota: 10000000,
//                         pretendToBeVisual: true, //jsdom acts to pretend as a visual browser
//                         //security violations - can give access to node js environment and hence inside the computer
//                         runScripts: "dangerously", //for executing scripts inside <script> tag
//                         resources: "usable" //for executing external scripts
//                     })
//                     ndom = await ndom
//                     }catch(ex){}
//                     ndom.window.onload = function(){
//                         ndom.window.document.body.onload = function(){
//                             setTimeout(console.log(ndom.window.OneSignal.config),0)
//                         }
//                     }
//                     // ndom.then(ndom => {console.log(ndom.window.document.body.innerHTML)})
//                 }
//             }
//         }
//     },0)
    
// })()

function callback(){
    setTimeout(callback, 100000)
}
setTimeout(callback, 100000)