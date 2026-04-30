const express = require('express');
const router = express.Router();
const cors = require('cors');
const sql = require('sqlite3');

const dbPath = './db/dev.sqlite3';

router.post('/', async (req, rsp) => {
    const client = req.body;
    const db = new sql.Database(dbPath);
    const params = [client.fname, client.lname, client.dob, client.nickname];
    const row = await new Promise(res => {
        db.get(`SELECT * FROM CLIENTS WHERE fname = ? AND lname = ? AND dob = ? AND nickname = ?`, params, function (err, row) {
            if (err)
                console.error('DB ERROR', err);
            res(row);
        });
    });

    if (row)
        return rsp.send({ok: false});

    db.run('INSERT INTO CLIENTS (fname, lname, dob, nickname) VALUES(?, ?, ?, ?)', params, function (err) {
        if (err) {
            console.error('DB ERROR', err);
            rsp.send({ok: false});
        } else
            rsp.send({ok: true});
    });

});

router.post('/details', async (req, rsp) => {
    const {userId, clientId, clientDetails} = req.body;
    const db = new sql.Database(dbPath);

    const result = await new Promise(res => {
        db.get('SELECT * FROM CLIENT_DETAILS WHERE user_id = ? AND client_id = ?', [userId, clientId], function (err, row) {
            if (err) {
                console.error('DB ERROR!', err);
                return res({row: null, error: true});
            }
            res({row, error: false});
        });
    });

    const {row, error} = result;
    if (error)
        return rsp.send({ok: false});

    const ok = await new Promise(res => {
        if (row) {
            const params = [clientDetails, userId, clientId];
            db.get('UPDATE CLIENT_DETAILS SET details = ? WHERE user_id = ? AND client_id = ?', params, function (err, row) {
                if (err) {
                    console.error('DB ERROR!', err);
                    return res(false);
                }
                res(true);
            });
        } else {            
            const params = [userId, clientId, clientDetails];
            db.get('INSERT INTO CLIENT_DETAILS (user_id, client_id, details) VALUES (?, ?, ?)', params, function (err, row) {
                if (err) {
                    console.error('DB ERROR!', err);
                    return res(false);
                }
                res(true);
            });
        }
    });

    rsp.send({ok});

});

module.exports = router;