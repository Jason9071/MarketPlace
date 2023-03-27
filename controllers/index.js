const express = require('express');
const router = express.Router();
const front = require('./front');
const cms = require('./cms');

router.use('/front', front);
router.use('/cms', cms);

module.exports = router;