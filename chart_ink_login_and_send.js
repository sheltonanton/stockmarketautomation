const jsdom = require("jsdom")
const {
    JSDOM
} = jsdom;

const CHARTINK_HOME = "https://chartink.com";

var doms = [];
for(var i=0; i < 1; i++){
    var promise = JSDOM.fromURL(CHARTINK_HOME, {
        refererer: CHARTINK_HOME,
        includeNodeLocations: true,
        storateQuota: 100000000,
        pretendToBeVisual: true,
        resources: 'usable'
    })
    doms.push(promise);
}
Promise.all(doms).then(values => {
    console.log("Promises resolved");
    var dom = values[0];
    dom.window.fetch = fetch;
    var csrf = Array.from(dom.window.document.getElementsByTagName("meta")).filter(x => x.getAttribute('name') == 'csrf-token')[0].getAttribute('content');
    var interval = setInterval(function(){
        if(count > 60){
            clearInterval(interval);
        }
        execute(dom, csrf);
    }, 500);
})

var count = 0;

function execute(dom, csrf){
    setTimeout(async function(){
        console.log(count++, csrf, await dom.window.fetch("screener/process", {
            "headers": {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-csrf-token": csrf
            },
            "body": "scan_clause=(+%7Bcash%7D+(+(+%7B33489%7D+(+%5B0%5D+15+minute+close+%3C+%5B-1%5D+15+minute+low+and+%5B+-1+%5D+15+minute+close+%3E%3D+%5B+-2+%5D+15+minute+low+and(+%7B33489%7D+(+%5B-1%5D+15+minute+high+%3E%3D+%5B-2%5D+15+minute+max(+20+%2C+%5B0%5D+15+minute+high+)+or(+%7B33489%7D+(+%5B-2%5D+15+minute+high+%3E%3D+%5B-3%5D+15+minute+max(+20+%2C+%5B0%5D+15+minute+high+)+and+%5B-1%5D+15+minute+low+%3E%3D+%5B-2%5D+15+minute+low+)+)+or(+%7B33489%7D+(+%5B-3%5D+15+minute+high+%3E%3D+%5B-4%5D+15+minute+max(+20+%2C+%5B0%5D+15+minute+high+)+and+%5B-2%5D+15+minute+low+%3E%3D+%5B-3%5D+15+minute+low+and+%5B-1%5D+15+minute+low+%3E%3D+%5B-2%5D+15+minute+low+)+)+or(+%7B33489%7D+(+%5B-4%5D+15+minute+high+%3E%3D+%5B-5%5D+15+minute+max(+20+%2C+%5B0%5D+15+minute+high+)+and+%5B-3%5D+15+minute+low+%3E%3D+%5B-4%5D+15+minute+low+and+%5B-2%5D+15+minute+low+%3E%3D+%5B-3%5D+15+minute+low+and+%5B-1%5D+15+minute+low+%3E%3D+%5B-2%5D+15+minute+low+)+)+)+)+and+latest+close+%3E+100+and+latest+close+%3C+1000+)+)+)+)+",
            "method": "POST"
        }));
    }, 0);
}

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
                } else if(this.status == 304){
                    console.log("Cached: " + req.response);
                } else {
                    console.log(req.response);
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
        if (options.body) req.send(options.body);
        else req.send();
    })
    return promise;
}

//construct different dom with different proxy ips and get all content without triggering dos attack