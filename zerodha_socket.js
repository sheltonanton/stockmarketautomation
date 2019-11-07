const socket = require('./zerodha_ticks')
const ERROR = "error";
const CLOSE = "exit";
const SUBSCRIPTION = "subscription";

(async function(){
    console.olog = function (message) {
        console.log(JSON.stringify({
            ...message
        }))
    }
    var websocket = new Promise((resolve, reject) => {
        var ws = socket.startSocket({
            onopen: function(){
                resolve(ws)
            },
            onmessage: function(data){
                data = JSON.parse(data)
                if(Array.isArray(data)){
                    console.olog({status: 'success', data})
                }else if(data.console){
                    console.olog({status: 'console', data: data.message})
                }
            }
        })
    })

    promise = new Promise((resolve, reject) => {
        process.stdin.on('data', function (input) {
            input = JSON.parse(input.toString())
            switch (input.status) {
                case CLOSE: {
                    close(resolve)
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
        websocket.then(ws => {
            console.olog({
                status: 'info',
                data: "web socket connected"
            })
            if (input.status == SUBSCRIPTION) {
                socket.subscribe(ws, input.data)
            }
        })
    }

    function close(resolve) {
        websocket.then(ws => {
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