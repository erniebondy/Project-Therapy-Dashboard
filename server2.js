const express = require('express');
const cors = require('cors');
const sql = require('sqlite3');
// const sql3 = require('sqlite3')
const crypto = require('node:crypto');

const app = express();
const port = process.env.PORT || 3000; //import.meta.env.VITE_PORT;
const dbPath = './db/dev.sqlite3';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text());

app.use((req, rsp, next) => {
    console.log('[SERVER]', req.method, req.url);
    next();
});

app.get('/', (req, rsp) => {
    rsp.end('ehool');
})

app.listen(port, () => {
    console.log('Server is listening!');
});