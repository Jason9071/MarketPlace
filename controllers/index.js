const express = require('express');
const router = express.Router();
const front = require('./front');
const cms = require('./cms');

router.use('/front', front);
router.use('/cms', cms);

router.all('*', (req, res) => {
    console.log("path not found");
    res.status(200).json({ "message": "unfound api path", "data": {} });
    return;
});

module.exports = router;