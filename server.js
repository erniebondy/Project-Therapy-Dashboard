const express = require('express');
const cors = require('cors');
const sql = require('sqlite3');
// const sql3 = require('sqlite3')
const crypto = require('node:crypto');

const app = express();
const port = 3000; //import.meta.env.VITE_PORT;
const dbPath = './db/dev.sqlite3';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text());

app.use((req, rsp, next) => {
    console.log('[SERVER]', req.method, req.url);
    next();
});


app.use('/user', require('./routes/user'));
app.use('/client', require('./routes/client'));
app.use('/admin', require('./routes/admin'));

app.post('/profile/new', async (req, rsp) => {
    const {username, email, password, phoneNumber} = req.body;
    const db = new sql.Database(dbPath);

    const row = await new Promise(res => {
        db.get('SELECT username FROM USERS WHERE username = ?', [username], function (err, row) {
            if (err) {
                console.error('DB Error!');
                return rsp.send({ok: false});
            }
            res(row);
        });
    });

    if (row) {
        console.log('Username exists!');
        return rsp.send({ok: false, message: 'Username already exists!'});
    }

    try {        
        const salt = crypto.randomBytes(16).toString('base64');
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('base64');
        const params = [username, hashedPassword, salt, email, phoneNumber];
        db.run('INSERT INTO USERS (username, hashed_password, salt, email, phone_number) VALUES (?, ?, ?, ?, ?)', params, 
            function (err) {
                if (err)
                    throw new Error(err.message);
                rsp.send({ok: true});
            }
        );

    } catch (err) {
        console.log('DB ERROR!', err);
        rsp.send({ok: false});
    }
    
});

app.get('/login/:username/:password', (req, rsp) => {
    const {username, password} = req.params;
    console.log(username, password);

    const db = new sql.Database(dbPath);
    let ok = false;
    let userId = -1;
    db.each('SELECT * FROM USERS WHERE username = ?', username, function (err, row) {
        if (err) {
            console.error('DB ERROR!', err);
            return rsp.send({ok: false});
        }
        const {hashed_password: dbHashedPassword, salt: dbSalt} = row;
        const hashedPassword = crypto.pbkdf2Sync(password, dbSalt, 310000, 32, 'sha256');
        if (crypto.timingSafeEqual(hashedPassword, Buffer.from(dbHashedPassword, 'base64'))) {
            userId = row.id;
            return ok = true;
        }
    }, function (err, count) {
        if (err) {
            console.error('DB ERROR!', err);
            return rsp.send({ok: false});
        }
        console.log('in complete');
        rsp.send({ok, userId});
    });

});

// app.post('/login', async (req, rsp) => {
//     const {username, password} = req.body;
//     console.log('posting', username, password);

//     try {        
//         const salt = crypto.randomBytes(16).toString('base64');
//         const hashedPassword = crypto.pbkdf2Sync(password, salt,310000, 32, 'sha256').toString('base64');
//         const db = new sql.Database(dbPath);
//         const params = [username, hashedPassword, salt];
//         db.run('INSERT INTO USERS (username, hashed_password, salt) VALUES (?, ?, ?)', params, function (err) {
//             if (err)
//                 throw new Error(err.message);
//             rsp.send({ok: true});
//         });

//     } catch (err) {
//         console.log('DB ERROR!', err);
//         rsp.send({ok: false});
//     }
// });

app.listen(port, () => {
    console.log('Server is listening!');
});