const express = require('express');
const router = express.Router();
//const cors = require('cors');
//const sql = require('sqlite3');
//
//const dbPath = './db/dev.sqlite3';

router.use('/milestone', require('./milestone'));

module.exports = router;