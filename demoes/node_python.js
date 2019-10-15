const {spawn} = require('child_process')
process = spawn('python', ['demoes/node_python.py'])
process.stdout.on('data', function (data) {
    console.log(data.toString())
})

var i =0;
function callback() {
    console.log("Writing "+i);
    process.stdin.write(`${i}`+'\n')
    i=i+1;
    if(i > 15) return;
    setTimeout(callback, 1000)
}

setTimeout(callback, 1000)