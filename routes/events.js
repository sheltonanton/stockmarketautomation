const express = require('express');
const router = express.Router();

router.notifications = new Events();
router.get('/', function(req, res, next){
    router.notifications.saveResponse(res);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.flushHeaders();
    router.notifications.reset();
    setInterval(function(){
        //read the stream of events from the pointer router.notifications.pointer
        let events = router.notifications.getMessages();
        for(var event of events){
            res.write(JSON.stringify(event) + '\n\n');
        }
        res.write('\n\n');
    }, 2000);
});

function Events() {
    this.events = [];
    this.changeHandlers = [];
    this.pointer = 0;
}

(function () {
    Events.prototype.reset = function () {
        this.pointer = 0;
    }
    Events.prototype.onpush = function (handler) {
        this.changeHandlers.push(handler);
    }
    Events.prototype.push = function (good, bad, status) {
        if (status == null && bad != null) {
            status = 'error';
        } else if (status == null) {
            status = 'success';
        }
        let event = {
            status,
            message: good,
            error: bad
        }
        this.events.push(event);
        for (var handler of this.changeHandlers) {
            typeof handler == 'function' && handler(event);
        }
    }
    Events.prototype.saveResponse = function (response) {
        this.response = response;
    }
    Events.prototype.stop = function () {
        this.response && this.response.status(200).end();
    }
    Events.prototype.getMessages = function () {
        let events = [];
        for (var i = this.pointer; i < this.events.length; i++) {
            events.push(this.events[i]);
        }
        this.pointer = this.events.length;
        return events;
    }
}());

module.exports = router;