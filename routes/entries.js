const express = require('express');
const router = express.Router();
const Entry = require('../models/entry');

/* GET ALL ENTRIES */
router.get('/', function (req, res, next) {
    let query = req.query || {}
    Entry.find(query, function (err, d) {
        res_send(res, err, {
            entries: d
        })
    })
})

/*GET A PARTICULAR ENTRY */
router.get('/:id', function (req, res, next) {
    let query = {
        _id: req.params['id']
    }
    Entry.find(query, function (err, d) {
        res_send(res, err, {
            entry: d
        })
    })
})

/* POST A ENTRY */
router.post('/', function (req, res, next) {
    let data = req.body.entry;
    Entry.create(data).then((r, err) => {
        express.ws_write('SAVED ENTRY: ' + r._id)
        if (!err) {
            res.send({
                entry: r
            })
        }
    })
})

/* DELETE A ENTRY */
router.delete('/:id', function (req, res, next) {
    let params = req.params;
    let id = params['id']
    Entry.deleteOne({
        _id: id
    }, function (err, d) {
        express.ws_write('', 'DELETED ENTRY: ' + params['id'])
        if (!err) {
            res.send({
                entry: {
                    _id: id
                }
            })
        }
    })
})

/* PUT A ENTRY */
router.put('/:id', function (req, res, next) {
    let id = req.params['id']
    let data = req.body.entry;
    Entry.updateOne({
        _id: id
    }, data, function (err, d) {
        express.ws_write('UPDATED ENTRY: ' + data['name'])
        res_send(res, err, {
            entry: d
        })
    })
})

function res_send(res, err, d) {
    if (err) {
        res.send({
            status: 'error',
            data: err
        })
    } else {
        res.send({
            status: 'success',
            ...d
        })
    }
}

module.exports = router;