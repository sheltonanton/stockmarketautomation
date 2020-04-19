const ticks = require('./zerodha_ticks')
const ERROR = "error";
const CLOSE = "exit";
const HISTORICAL_DATA = "historical_data";
const SUBSCRIPTION = "subscription";

(async function(){
    
    console.olog = function (message) {
        console.log(JSON.stringify({
            ...message
        }))
    }
    var websocket = new Promise((resolve, reject) => {
        var ws;
        const callbacks = {
            onopen: async function () {
                ws = await ws;
                resolve({ws, callbacks})
            },
            onmessage: function (data) {
                if(typeof data == 'string')
                    data = JSON.parse(data)
                if (Array.isArray(data)) {
                    console.olog({
                        status: 'success',
                        data
                    })
                } else if (data.console) {
                    console.olog({
                        status: 'console',
                        data: data.message
                    })
                }
            }
        };
        ws = ticks.startSocket(callbacks);
    })

    promise = new Promise((resolve, reject) => {
        process.stdin.on('data', function (input) {
            input = JSON.parse(input.toString())
            switch (input.status) {
                case CLOSE: {
                    close(resolve)
                    break;
                }
                case HISTORICAL_DATA: {
                    ticks.get_historical_data(input);
                    break;
                }
                default: {
                    console.olog({status: 'info', data:input})
                    input_data(input)
                }
            }
        })
    })

    function input_data(input) {
        websocket.then(({ws, callbacks}) => {
            console.olog({
                status: 'info',
                data: "web socket connected"
            })
            let {
                ids,
                auth
            } = input
            if (input.status == SUBSCRIPTION) {
                ticks.subscribe(callbacks, ws, ids, auth)
            }
        })
    }

    function close(resolve) {
        websocket.then(({ws, callbacks}) => {
            ws.close();
            resolve();
            console.olog({
                status: 'exit',
                data: 'process exited'
            })
            process.exit();
        })
    }
}())

//apis
/*
    live data feed ( should be streamed )
    getting historical data ( what is the best way? )
    subscribing to stocks ( this should be a consuming action )
    closing the web socket ( what is the best way? )
    initializing the web socket ( what is the best way? )
    removing subscription ** ( this should be a consuming action )
*/