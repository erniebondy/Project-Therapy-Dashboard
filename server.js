const express = require('express');
const cors = require('cors');
const sql = require('sqlite3');
// const sql3 = require('sqlite3')
const crypto = require('node:crypto');

const app = express();
const port = 3000;
const dbPath = './db/dev.sqlite3';

app.use(cors());
app.use(express.json());
app.use(express.text());

app.use((req, rsp, next) => {
    console.log('[SERVER]', req.method, req.url);
    next();
});

app.get('/db/user/:id', (req, rsp) => {
    const {id} = req.params;
    const db = new sql.Database(dbPath);
    db.get('SELECT * FROM USERS WHERE id = ?', id, function (err, row) {
        if (err) {
            console.error('DB ERROR!', err);
            return rsp.send({data: null});
        }

        rsp.send({data: row});
    });
});

app.delete('/db/user/task', async (req, rsp) => {
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

app.put('/db/user/tasks', async (req, rsp) => {
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

app.post('/db/user/tasks', async (req, rsp) => {
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

app.get('/db/user/:id/tasks', (req, rsp) => {
    const {id} = req.params;
    const db = new sql.Database(dbPath);
    db.get('SELECT data FROM USER_TASKS WHERE user_id = ?', id, function (err, row) {
        if (err)
            console.error('DB ERROR', err);
        rsp.send({data: row?.data});
    });
});

app.get('/db/user/:id/schedule/month/:key', async (req, rsp) => {
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

app.put('/db/user/schedule/month', async (req, rsp) => {
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

app.delete('/db/user/client', (req, rsp) => {
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

app.post('/db/user/client', (req, rsp) => {
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
app.get('/db/user/:id/clients', async (req, rsp) => {
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

app.get('/db/user/:id/unassigned-clients', async (req, rsp) => {
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

app.post('/db/client', async (req, rsp) => {
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

app.post('/db/client/details', async (req, rsp) => {
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

app.get('/db/user/:userId/client/:clientId/details', async (req, rsp) => {
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

app.post('/db/login', async (req, rsp) => {

    // get username & password
    const {username, password} = req.body;
    console.assert(username != null && password != null);

    // get user by username
    const db = new sql.Database(dbPath);
    // const db = await sql.open({filename: dbPath, driver: sql3.Database});
    
    const row = await new Promise((res, rej) => {
        db.get('SELECT * FROM USERS WHERE username = ?', username, (err, row) => {
            return res(row);
        });
    });

    if (!row) {
        addNewUser(username, password);
        return rsp.send({message: 'User logged in!', loggedIn: true});
    }
    
    // Username found
    if (!passwordMatch({dbPassword: row.hashed_password, dbSalt: row.salt})) {
        addNewUser(username, password);
        return rsp.send({message: 'User logged in!', loggedIn: true});
    }

    // User already exists
    return rsp.send({message: 'User exists!', loggedIn: true});

    function passwordMatch(dbData) {
        
        const {dbPassword, dbSalt} = dbData;
        const hashedPassword = crypto.pbkdf2Sync(password, dbSalt, 310000, 32, 'sha256');

        return crypto.timingSafeEqual(hashedPassword, Buffer.from(dbPassword, 'base64'));
    }

    function addNewUser(username, password) {

        const salt = crypto.randomBytes(16).toString('base64');        
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('base64');


        const params = [username, hashedPassword, salt];
        db.run('INSERT INTO USERS (username, hashed_password, salt) VALUES(?, ?, ?)', params);

        // console.log('value', value); // Could get value.lastID

        // db.run('INSERT INTO USERS (username, hashed_password, salt) VALUES(?, ?, ?)', 
        //     [username, hashedPassword, salt], 
        //     function (err) {
        //         if (err)
        //             console.error('DB ERROR!');
        //     }
        // );
    }

});

app.listen(port, () => {
    console.log('Server is listening!');
});