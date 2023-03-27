const express = require('express');
const router = express.Router();
const user = require('./user');
const order = require('./order');
const image = require('./image');
const deposit = require('./deposit');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('FRONT Time: ', new Date);
    next();
})

router.post('/user/login', user.login);

router.post('/user', user.create);

router.route('/user/:accessToken')
    .get(user.get)
    .put(user.update);

router.route('/user/:accessToken/order')
    .get(order.getAll);

router.route('/user/:accessToken/order/in/bk')
    .post(order.inBk);

router.route('/user/:accessToken/order/out/bk')
    .post(order.outBk);

router.route('/user/:accessToken/order/out/bc')
    .post(order.outBc);

router.route('/user/:accessToken/image/:fileName')
    .get(image.get);

router.route('/user/:accessToken/deposit')
    .get(deposit.get);

module.exports = router;