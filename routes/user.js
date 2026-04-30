const express = require('express');
const router = express.Router();
const cors = require('cors');
const sql = require('sqlite3');

const dbPath = './db/dev.sqlite3';

router.put('/', (req, rsp) => {
    const {user} = req.body;
    const db = new sql.Database(dbPath);
    const params = [user.username, user.email, user.phone_number, user.id];
    db.run('UPDATE USERS SET username = ?, email = ?, phone_number = ? WHERE id = ?', params, function (err) {
        if (err) {
            console.error('DB ERROR!', err);
            return rsp.send({ok: false});
        }
        rsp.send({ok: true});
    });

});

router.get('/:id', (req, rsp) => {
    const {id} = req.params;
    const db = new sql.Database(dbPath);
    db.get('SELECT * FROM USERS WHERE id = ?', id, function (err, row) {
        if (err) {
            console.error('DB ERROR!', err);
            return rsp.send({data: null});
        }

        return rsp.send({data: row});
    });
});

router.delete('/task', async (req, rsp) => {
    const {userId, tasks} = req.body;
    const db = new sql.Database(dbPath);
    
    const ok = await new Promise(res => { 
        db.run('UPDATE USER_TASKS SET data = ? WHERE user_id = ?', [JSON.stringify(tasks), userId], function (err) {
            if (err) {
                console.error('DB ERROR', err);
                return res(false);
            }
            return res(true);
        });
    });

    rsp.send({ok});
});

router.put('/tasks', async (req, rsp) => {
    const {userId, tasks} = req.body;
    const db = new sql.Database(dbPath);
    
    const ok = await new Promise(res => { 
        db.run('UPDATE USER_TASKS SET data = ? WHERE user_id = ?', [JSON.stringify(tasks), userId], function (err) {
            if (err) {
                console.error('DB ERROR', err);
                return res(false);
            }
            return res(true);
        });
    });

    rsp.send({ok});
});

router.post('/tasks', async (req, rsp) => {
    const {userId, tasks} = req.body;
    const db = new sql.Database(dbPath);
    const result = await new Promise(res => {
        db.get('SELECT * FROM USER_TASKS WHERE user_id = ?', userId, function (err, row) {
            if (err) {
                console.error('DB ERROR', err);
                return res({row, error: true})
            }
            res({row, error: false});
        });
    });
    
    const {error, row} = result;
    if (error)
        return rsp.send({ok: false});

    const ok = await new Promise(res => { 
        if (row) {
            db.run('UPDATE USER_TASKS SET data = ? WHERE user_id = ?', [JSON.stringify(tasks), userId], function (err) {
                if (err) {
                    console.error('DB ERROR', err);
                    return res(false);
                }
                res(true);
            });
        } else {
            db.run('INSERT INTO USER_TASKS (user_id, data) VALUES (?, ?)', [userId, JSON.stringify(tasks)], function (err) {
                if (err) {
                    console.error('DB ERROR', err);
                    return res(false);
                }
                res(true);
            });
        }
    });

    rsp.send({ok});
});

router.get('/:id/tasks', (req, rsp) => {
    const {id} = req.params;
    const db = new sql.Database(dbPath);
    db.get('SELECT data FROM USER_TASKS WHERE user_id = ?', id, function (err, row) {
        if (err)
            console.error('DB ERROR', err);
        rsp.send({data: row?.data});
    });
});

router.get('/:id/schedule/month/:key', async (req, rsp) => {
    const {id, key} = req.params;
    const params = [id, 'month', key];
    const db = new sql.Database(dbPath);
    const row = await new Promise(res => {
        db.get('SELECT data FROM USER_SCHEDULES WHERE user_id = ? AND type = ? AND key = ?', params, function (err, row) {
            if (err)
                console.error('DB ERROR', err);
            res(row);
        });
    });
    rsp.send({data: (row) ? row.data : null});
});

router.put('/schedule/month', async (req, rsp) => {
    const {userId, cellsText, key} = req.body;
    const db = new sql.Database(dbPath);
    const result = await new Promise(res => {
        db.get('SELECT * FROM USER_SCHEDULES WHERE user_id = ? AND key = ?', [userId, key], function (err, row) {
            if (err) {
                console.error('DB ERROR!', err);
                return res({row, error: true});
            }
            res({row, error: false});
        });
    });

    const {row, error} = result;
    if (error)
        return rsp({ok: false});

    const ok = await new Promise(res => {
        if (row) {
            db.run('UPDATE USER_SCHEDULES SET data = ? WHERE user_id = ? AND key = ?', [JSON.stringify(cellsText), userId, key], function (err) {
                if (err) {
                    console.error('DB ERROR', err);
                    return res(false);
                }
                res(true);
            });
        } else {
            db.run('INSERT INTO USER_SCHEDULES (user_id, type, key, data) VALUES(?, ?, ?, ?)', [userId, 'month', key, JSON.stringify(cellsText)], function (err) {
                if (err) {
                    console.error('DB ERROR', err);
                    return res(false);
                }
                res(true);
            });
        }
    });

    rsp.send({ok});

});

router.delete('/client', (req, rsp) => {
    const {userId, clientId} = req.body;
    const params = [userId, clientId];
    const db = new sql.Database(dbPath);
    db.run('DELETE FROM USERS_CLIENTS WHERE user_id= ? AND client_id= ?', params, function (err) {
        if (err) {
            console.error('DB ERROR', err);
            return rsp.send({ok: false});
        }
        rsp.send({ok: true});
    });
});

router.post('/client', (req, rsp) => {
    const {userId, clientId} = req.body;
    const params = [userId, clientId];
    const db = new sql.Database(dbPath);
    db.run('INSERT INTO USERS_CLIENTS (user_id, client_id) VALUES(?, ?)', params, function (err) {
        if (err) {
            console.error('DB ERROR', err);
            return rsp.send({ok: false});
        }
        rsp.send({ok: true});
    });

});

// Similar QUERIES
router.get('/:id/clients', async (req, rsp) => {
    const {id} = req.params;
    const db = new sql.Database(dbPath);
    const rows = await new Promise(res => {
        db.all(
            `SELECT C.*, C.fname || ' ' || C.lname AS fullname, strftime('%Y', date()) - strftime('%Y', dob) AS age, CD.details
            FROM CLIENTS C
            LEFT JOIN USERS_CLIENTS UC on C.id = UC.client_id
            LEFT JOIN CLIENT_DETAILS CD ON C.id = CD.client_id AND CD.user_id = ?
            WHERE UC.user_id = ?`,
            [id, id], function (err, rows) {
            if (err)
                console.error('DB ERROR', err);
            res(rows);
        });
    });

    rsp.send({data: rows});
});

router.get('/:id/unassigned-clients', async (req, rsp) => {
    const {id} = req.params;
    const db = new sql.Database(dbPath);
    const rows = await new Promise(res => {
        db.all(
            `SELECT C.*, C.fname || ' ' || C.lname AS fullname, strftime('%Y', date()) - strftime('%Y', dob) AS age
            FROM CLIENTS C
            LEFT JOIN USERS_CLIENTS UC ON C.id = UC.client_id
            WHERE UC.client_id NOT IN (
                SELECT client_id FROM USERS_CLIENTS
                WHERE user_id = ?
            ) OR UC.user_id ISNULL`,
            id,
            function (err, rows) {
                if (err)
                    console.error('DB ERROR!', err);
                res(rows);
            }
        );
    });

    rsp.send({data: rows});
});

router.get('/user/:userId/client/:clientId/details', async (req, rsp) => {
    const {userId, clientId} = req.params;
    const params = [userId, clientId];
    const db = new sql.Database(dbPath);

    const row = await new Promise(res => {
        db.get(`SELECT details FROM CLIENT_DETAILS D
            LEFT JOIN USERS U on D.user_id = U.id
            LEFT JOIN CLIENTS C on D.client_id = C.id
            WHERE D.user_id = ? AND D.client_id = ?`, params, 
            function (err, row) {
                if (err)
                    console.error('DB ERROR', err);
                res(row);
            }
        );
    });

    const details = (row) ? row.details : null;
    rsp.send({data: details});
});

module.exports = router;

