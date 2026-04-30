const express = require('express');
const cors = require('cors');
const sql = require('sqlite3');
// const sql3 = require('sqlite3')
const crypto = require('node:crypto');

const app = express();
const port = 3000;
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


app.post('/login', async (req, rsp) => {

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