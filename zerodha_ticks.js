const jsdom = require('jsdom');
const {JSDOM} = jsdom;
var websocket = null;
var window = null;

async function mainFunc(callbacks){
	let promise = JSDOM.fromURL('http://kite.zerodha.com', {
    refererer: 'http://kite.zerodha.com',
    includeNodeLocations: true,
    storageQuota: 10000000,
    pretendToBeVisual: true, //jsdom acts to pretend as a visual browser
    //security violations - can give access to node js environment and hence inside the computer
    runScripts: "dangerously", //for executing scripts inside <script> tag
    resources: "usable" //for executing external scripts
  })
let dom = await promise;
window = dom.window

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
    ].join('-');
};

function fetch(url, options) {
    promise = new Promise((resolve, reject) => {
        req = new this.window.XMLHttpRequest()
        req.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    try {
                        resolve(req.response && JSON.parse(req.response))
                    } catch (err) {
                        reject({
                            err,
                            response: req.response
                        })
                    }
                } else {
                    reject({
                        err: this.status,
                        response: req.response
                    })
                }
            }
        };
        req.open(options.method, url)
        Object.keys(options.headers || {}).forEach(key => {
            req.setRequestHeader(key, options.headers[key])
        })
        if (options.body) req.send(options.body);
        else req.send();
    })
    return promise;
}

window.fetch = fetch.bind(window)

var r = function() {
    function t() {
        this.handlers = []
    }
    return t.prototype.on = function(t) {
        this.handlers.push(t)
    }, t.prototype.off = function(t) {
        this.handlers = this.handlers.filter(function(e) {
            return e !== t
        })
    }, t.prototype.trigger = function(t) {
        this.handlers.slice(0).forEach(function(e) {
            return e(t)
        })
    }, t
}()
function func() {
    function t(t) {
        this.mSubscribe = "subscribe", this.mUnSubscribe = "unsubscribe", this.mSetMode = "mode", this.mGetQuote = "quote", this.mAlert = 10, this.mOrderStr = "order", this.mMessage = 11, this.mMessageStr = "message", this.mLogout = 12, this.mLogoutStr = "logout", this.mReload = 13, this.mReloadStr = "reload", this.mClearCache = 14, this.mClearCacheStr = "clear_cache", this.modeLTP = "ltp", this.modeLTPC = "ltpc", this.modeFull = "full", this.modeQuote = "quote", this.modeWeights = (e = {}, e[this.modeFull] = 1, e[this.modeQuote] = 2, e[this.modeLTPC] = 3, e[this.modeLTP] = 4, e), this.weightModeMap = {
            1: this.modeFull,
            2: this.modeQuote,
            3: this.modeLTPC,
            4: this.modeLTP
        }, this.segmentNseCM = 1, this.segmentNseFO = 2, this.segmentNseCD = 3, this.segmentBseCM = 4, this.segmentBseFO = 5, this.segmentBseCD = 6, this.segmentMcxFO = 7, this.segmentMcxSX = 8, this.segmentNseIndices = 9, this.eventConnect = new r, this.eventTick = new r, this.eventData = new r, this.eventDisconnect = new r, this.eventReconnect = new r, this.eventNoReconnect = new r, this.eventAlert = new r, this.eventMessage = new r, this.eventReload = new r, this.eventClearCache = new r, this.eventLogout = new r, this.connectionTimeout = 5, this.reconnectInterval = 5, this.reconnectTries = 300, this.isAutoReconnect = !0, this.reconnectionsCount = 0, this.currentWsUrl = null, this.tokenTags = {}, this.subscribedTokens = [], this.defaultTokenTag = "_", this.version = "1.0.0", this.userAgent = "kite3-web", this.quoteMap = {}, this.getQuoteTimeout = 5, this.address = t.address, this.apiKey = t.apiKey, this.publicToken = t.publicToken, this.userId = t.userId, t.version && (this.version = t.version);
        var e
    }
    t.prototype.isConnected = function() {
        return !(!this.ws || this.ws.readyState !== this.ws.OPEN)
    }, t.prototype.setAutoReconnect = function(t, e) {
        this.isAutoReconnect = t, this.reconnectTries = e
    }, t.prototype.getsubscribedTokens = function() {
        return this.subscribedTokens
    }, t.prototype.connect = function() {
        var t = this;
        (!this.ws || this.ws.readyState !== this.ws.CONNECTING && this.ws.readyState !== this.ws.OPEN) && (this.ws = new window.WebSocket(this.address + "?api_key=" + this.apiKey + "&user_id=" + this.userId + "&public_token=" + this.publicToken + "&uid=" + (new Date).getTime().toString() + "&user-agent=" + this.userAgent + "&version=" + this.version), this.ws.binaryType = "arraybuffer", this.ws.onopen = function(e) {
            t.resubscribe(), t.eventConnect.trigger(), t.setConnectionTimer()
        }, this.ws.onmessage = function(e) {
            if (t.eventData.trigger(e.data), e.data instanceof ArrayBuffer) {
                if (e.data.byteLength > 2) {
                    var n = t.parseBinary(e.data);
                    n && t.eventTick.trigger(n)
                }
            } else t.processMessage(e.data);
            t.lastDataReceivedTime = new Date()
        }, this.ws.onerror = function(e) {
            t.ws && t.ws.readyState === t.ws.OPEN && this.close()
        }, this.ws.onclose = function(e) {
            t.currentWsUrl && this.url != t.currentWsUrl || t.triggerDisconnect()
        })
    }, t.prototype.subscribe = function(t, e) {
        e = this.getTag(e);
        for (var n = [], i = 0, s = t; i < s.length; i++) {
            var r = s[i];
            "number" == typeof r && (this.isElementInArray(this.subscribedTokens, r) || (n.push(r), this.tokenTags[r] = {
                mode: "",
                tags: {}
            }, this.subscribedTokens.push(r)))
        }
        return n.length > 0 && this.send({
            a: this.mSubscribe,
            v: n
        }), n
    }, t.prototype.unsubscribe = function(t, e) {
        e = this.getTag(e);
        for (var n = [], i = 0, s = t; i < s.length; i++) {
            var r = s[i];
            "number" == typeof r && (this.deleteTokenTags(r, e), this.canUnsubscribe(r, e) && (n.push(r), this.deleteSubscriptionToken(r), delete this.tokenTags[r]))
        }
        return n.length > 0 && this.send({
            a: this.mUnSubscribe,
            v: n
        }), n
    }, t.prototype.setMode = function(t, e, n) {
        n = this.getTag(n);
        for (var i = {}, s = 0, r = e; s < r.length; s++) {
            var a = r[s];
            if (this.isElementInArray(this.subscribedTokens, a)) {
                if (t !== this.tokenTags[a].mode && "number" == typeof a) {
                    this.updateTokenTags(a, t, n);
                    var o = this.getBestMode(a, t, n);
                    o && o !== this.tokenTags[a].mode && (i[o] || (i[o] = []), i[o].push(a)), this.tokenTags[a].mode = o
                }
            } else this.deleteTokenTags(a, n)
        }
        for (var c = 0, l = Object.keys(i); c < l.length; c++) {
            var t = l[c];
            this.send({
                a: this.mSetMode,
                v: [t, i[t]]
            })
        }
    }, t.prototype.resubscribe = function() {
        if (0 !== this.subscribedTokens.length) {
            for (var t = {}, e = 0, n = this.subscribedTokens; e < n.length; e++) {
                var i = n[e];
                "number" == typeof i && (this.tokenTags[i] && this.tokenTags[i].mode && (t[this.tokenTags[i].mode] || (t[this.tokenTags[i].mode] = []), t[this.tokenTags[i].mode].push(i)))
            }
            this.send({
                a: this.mSubscribe,
                v: this.subscribedTokens
            });
            for (var s = 0, r = Object.keys(t); s < r.length; s++) {
                var a = r[s];
                this.send({
                    a: this.mSetMode,
                    v: [a, t[a]]
                })
            }
        }
    }, t.prototype.getQuote = function(t, e, n, i) {
        var r = this;
        return this.quoteMap[t] = new s, i || (i = this.getQuoteTimeout), setTimeout(function() {
            var e = r.quoteMap[t];
            e && (e.reject(), delete r.quoteMap[t])
        }, 1e3 * i), this.send({
            id: t,
            a: this.mGetQuote,
            v: {
                fields: n,
                tokens: e
            }
        }), this.quoteMap[t].promise
    }, t.prototype.isElementInArray = function(t, e) {
        return t.filter(function(t) {
            return t === e
        }).length > 0
    }, t.prototype.deleteSubscriptionToken = function(t) {
        var e = this.subscribedTokens.indexOf(t);
        e > -1 && this.subscribedTokens.splice(e, 1)
    }, t.prototype.getTag = function(t) {
        return t && "string" == typeof t ? t : this.defaultTokenTag
    }, t.prototype.updateTokenTags = function(t, e, n) {
        n != this.defaultTokenTag && (this.tokenTags[t] || (this.tokenTags[t] = {
            mode: e,
            tags: {}
        }), this.tokenTags[t].tags[n] = this.modeWeights[e])
    }, t.prototype.deleteTokenTags = function(t, e) {
        this.tokenTags[t] && this.tokenTags[t].tags && this.tokenTags[t].tags[e] && delete this.tokenTags[t].tags[e]
    }, t.prototype.getBestMode = function(t, e, n) {
        var i = this;
        if (n == this.defaultTokenTag) return e;
        var s = Math.min.apply(Math, Object.keys(this.tokenTags[t].tags).map(function(e) {
            return i.tokenTags[t].tags[e]
        }));
        return s ? this.weightModeMap[s] : e
    }, t.prototype.canUnsubscribe = function(t, e) {
        return !!this.isElementInArray(this.subscribedTokens, t) && (e == this.defaultTokenTag || (!this.tokenTags[t] || !(Object.keys(this.tokenTags[t].tags).filter(function(t) {
            return t != e
        }).length > 0)))
    }, t.prototype.triggerDisconnect = function() {
        this.eventDisconnect.trigger(), this.isAutoReconnect ? this.attemptReconnection() : this.eventNoReconnect.trigger()
    }, t.prototype.setConnectionTimer = function() {
        var t = this;
        clearInterval(this.connectionTimer), this.lastDataReceivedTime = new Date, this.connectionTimer = setInterval(function() {
            ((new Date).getTime() - t.lastDataReceivedTime.getTime()) / 1e3 >= t.connectionTimeout && (t.currentWsUrl = null, t.ws && t.ws.close(), clearInterval(t.connectionTimer), t.triggerDisconnect())
        }, 1e3 * this.connectionTimeout)
    }, t.prototype.attemptReconnection = function() {
        var t = this;
        if (this.reconnectionsCount > this.reconnectTries) return void this.eventNoReconnect.trigger();
        this.eventReconnect.trigger(this.reconnectInterval), setTimeout(function() {
            t.connect()
        }, 1e3 * this.reconnectInterval), this.reconnectionsCount++
    }, t.prototype.send = function(t) {
        if (this.ws && this.ws.readyState == this.ws.OPEN) try {
            this.ws.send(JSON.stringify(t))
        } catch (t) {
            this.ws.close()
        }
    }, t.prototype.dateToString = function(t) {
        var e = t.getFullYear().toString(),
            n = (t.getMonth() + 1).toString(),
            i = t.getDate().toString(),
            s = t.getMinutes().toString(),
            r = t.getHours().toString(),
            a = t.getSeconds().toString();
        return n.length < 2 && (n = "0" + n), i.length < 2 && (i = "0" + i), r.length < 2 && (r = "0" + r), s.length < 2 && (s = "0" + s), a.length < 2 && (a = "0" + a), e + "-" + n + "-" + i + " " + r + ":" + s + ":" + a
    }, t.prototype.parseBinary = function(t) {
        for (var e = this.splitPackets(t), n = [], i = 0, s = e; i < s.length; i++) {
            var r = s[i],
                a = this.buf2long(r.slice(0, 4)),
                o = 255 & a,
                c = 100,
                l = void 0;
            switch (o == this.segmentNseCD && (c = 1e7), o) {
                case this.segmentMcxFO:
                case this.segmentNseCM:
                case this.segmentBseCM:
                case this.segmentNseFO:
                case this.segmentNseCD:
                case this.segmentNseIndices:
                    if (8 === r.byteLength) n.push({
                        mode: this.modeLTP,
                        isTradeable: !0,
                        token: a,
                        lastPrice: this.buf2long(r.slice(4, 8)) / c
                    });
                    else if (12 === r.byteLength) {
                        if (l = {
                                mode: this.modeLTPC,
                                isTradeable: !0,
                                token: a,
                                lastPrice: this.buf2long(r.slice(4, 8)) / c,
                                closePrice: this.buf2long(r.slice(8, 12)) / c
                            }, l.change = 0, l.absoluteChange = 0, 0 !== l.closePrice) {
                            var u = l.lastPrice - l.closePrice;
                            l.change = 100 * u / l.closePrice, l.absoluteChange = u
                        }
                        n.push(l)
                    } else if (28 === r.byteLength || 32 === r.byteLength) {
                        if (l = {
                                mode: this.modeFull,
                                isTradeable: !1,
                                token: a,
                                lastPrice: this.buf2long(r.slice(4, 8)) / c,
                                highPrice: this.buf2long(r.slice(8, 12)) / c,
                                lowPrice: this.buf2long(r.slice(12, 16)) / c,
                                openPrice: this.buf2long(r.slice(16, 20)) / c,
                                closePrice: this.buf2long(r.slice(20, 24)) / c
                            }, l.change = 0, l.absoluteChange = 0, 0 !== l.closePrice) {
                            var u = l.lastPrice - l.closePrice;
                            l.change = 100 * u / l.closePrice, l.absoluteChange = u
                        }
                        n.push(l)
                    } else {
                        if (l = {
                                mode: this.modeQuote,
                                token: a,
                                isTradeable: !0,
                                volume: this.buf2long(r.slice(16, 20)),
                                lastQuantity: this.buf2long(r.slice(8, 12)),
                                totalBuyQuantity: this.buf2long(r.slice(20, 24)),
                                totalSellQuantity: this.buf2long(r.slice(24, 28)),
                                lastPrice: this.buf2long(r.slice(4, 8)) / c,
                                averagePrice: this.buf2long(r.slice(12, 16)) / c,
                                openPrice: this.buf2long(r.slice(28, 32)) / c,
                                highPrice: this.buf2long(r.slice(32, 36)) / c,
                                lowPrice: this.buf2long(r.slice(36, 40)) / c,
                                closePrice: this.buf2long(r.slice(40, 44)) / c
                            }, l.change = 0, l.absoluteChange = 0, 0 !== l.closePrice) {
                            var u = l.lastPrice - l.closePrice;
                            l.change = 100 * u / l.closePrice, l.absoluteChange = u
                        }
                        if (164 === r.byteLength || 184 === r.byteLength) {
                            var d = 44;
                            184 === r.byteLength && (d = 64);
                            var h = d + 120;
                            if (l.mode = this.modeFull, l.depth = {
                                    buy: [],
                                    sell: []
                                }, 184 === r.byteLength) {
                                var f = this.buf2long(r.slice(44, 48));
                                l.lastTradedTime = f && f > 0 ? this.dateToString(new Date(1e3 * f)) : null, l.oi = this.buf2long(r.slice(48, 52)), l.oiDayHigh = this.buf2long(r.slice(52, 56)), l.oiDayLow = this.buf2long(r.slice(56, 60))
                            }
                            for (var p = 0, v = r.slice(d, h), _ = 0; _ < 10; _++) p = 12 * _, l.depth[_ < 5 ? "buy" : "sell"].push({
                                price: this.buf2long(v.slice(p + 4, p + 8)) / c,
                                orders: this.buf2long(v.slice(p + 8, p + 10)),
                                quantity: this.buf2long(v.slice(p, p + 4))
                            })
                        }
                        l.t = parseInt(new Date().getTime()/1000)
                        n.push(l)
                    }
            }
        }
        return n
    }, t.prototype.splitPackets = function(t) {
        for (var e = this.buf2long(t.slice(0, 2)), n = 2, i = [], s = 0; s < e; s++) {
            var r = this.buf2long(t.slice(n, n + 2)),
                a = t.slice(n + 2, n + 2 + r);
            i.push(a), n += 2 + r
        }
        return i
    }, t.prototype.processMessage = function(t) {
        try {
            var e = JSON.parse(t)
        } catch (t) {
            return
        }
        if (e.hasOwnProperty("t") || e.hasOwnProperty("type")) {
            var n = e.t || e.type,
                i = e.p || e.data;
            switch (n) {
                case this.mAlert:
                case this.mOrderStr:
                    this.eventAlert.trigger(e);
                    break;
                case this.mMessage:
                case this.mMessageStr:
                    this.eventMessage.trigger(i);
                    break;
                case this.mLogout:
                case this.mLogoutStr:
                    this.eventLogout.trigger();
                    break;
                case this.mReload:
                case this.mReloadStr:
                    this.eventReload.trigger();
                    break;
                case this.mClearCache:
                case this.mClearCacheStr:
                    if (i) try {
                        var s = JSON.parse(i);
                        this.eventClearCache.trigger(s)
                    } catch (t) {
                        return
                    } else this.eventClearCache.trigger();
                    break;
                case this.mGetQuote:
                    this.processQuoteMessage(e.id, i)
            }
        }
    }, t.prototype.processQuoteMessage = function(t, e) {
        var n = this.quoteMap[t];
        n && (n.resolve(e), delete this.quoteMap[t])
    }, t.prototype.buf2long = function(t) {
        for (var e = new Uint8Array(t), n = 0, i = e.length, s = 0, r = i - 1; s < i; s++, r--) n += e[r] << 8 * s;
        return n
    } 
    t.prototype.websocketconnect = function(url){
        ws = new window.WebSocket("wss://ws.zerodha.com/?api_key=kitefront&user_id=IV8690&user-agent=kite3-web&version=2.2.0")
        websocket = ws
        ws.binaryType = 'arraybuffer'
        ws.onopen = callbacks.onopen
        ws.onmessage = function(e){
            if (e.data instanceof ArrayBuffer) {
                if (e.data.byteLength > 2) {
                    var n = t.parseBinary(e.data);
                    callbacks.onmessage(JSON.stringify(n))
                }
            } else {
                callbacks.onmessage(JSON.stringify({console:true,message:JSON.parse(e.data)}))
                if(typeof e.data == 'object')
                    callbacks.onmessage(JSON.stringify(n))
                t.processMessage(e.data);
            } 
            t.lastDataReceivedTime = new Date()
        }
    }
    var t = new t("wss://ws.zerodha.com/")
    t.websocketconnect()
}
func()
}
function callback(){
	setTimeout(callback, 1000)
}
callback()

async function startSocket(callbacks){
    await mainFunc(callbacks)
    await callback()
    return websocket
}

function subscribe(callbacks, ws, ids, auth) {
    ids.forEach(async function(id){
        //get 1 minute historical data from all the stocks for the past 50 days
        //change the data format and send it accordingly
        let historical = await fetchHistoricalData(id, auth);
        callbacks.onmessage(historical);
    })
    ws.send(JSON.stringify({
        a: "subscribe",
        v: ids
    }))
}

async function fetchHistoricalData(id, auth) {
    var to = new Date();
    var from = new Date(to - (21 * 24 * 60 * 60 * 1000));
    var quotes = [];
    for (var i=0; i<1; i++) {
        try{
            var quote = await window.fetch(`https://kite.zerodha.com/oms/instruments/historical/${id}/minute?user_id=IV8690&oi=1&from=${from.yyyymmdd()}&to=${to.yyyymmdd()}`, {
                "headers": {
                    "authorization": auth,
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
            quotes = quote.data.candles.concat(quotes);
        }catch(e){
            console.log(e);
        }
    }
    quotes = quotes.map(quote => {
        let [date, open, high, low, close, volume] = quote;
        date = parseInt(new Date(date).getTime()/1000);
        let o = {
            open,
            high,
            low,
            close,
            time: date,
            sm: false,
            isCandle: true,
            interval: 60,
            token: id,
            noTrade: true
        }
        return o;
    })
    return quotes;
}

module.exports = {
    startSocket,
    subscribe
}