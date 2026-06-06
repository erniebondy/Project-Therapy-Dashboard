const express = require('express');
const router = express.Router();

router.use('/milestone', require('./milestone'));

module.exports = router;