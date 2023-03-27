const express = require('express');
const router = express.Router();
const admin = require('./admin');
const boss = require('./boss');
const user = require('./user');
const order = require('./order');
const image = require('./image');
const deposit = require('./deposit');

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('CMS Time: ', new Date);
    next();
})

router.route('/admin/:accessToken/boss/user')
    .get(user.getAll)
    .put(user.update);

router.route('/admin/:accessToken/boss/user/:id')
    .get(user.get);

router.route('/admin/:accessToken/boss/order')
    .get(order.get)
    .put(order.update);

router.route('/admin/:accessToken/boss/deposit')
    .get(deposit.get)
    .put(deposit.update);

router.post('/admin/login', admin.login);

router.route('/admin/:accessToken')
    .get(admin.get)
    .put(admin.update);

router.route('/admin/:accessToken/boss')
    .get(boss.get)
    .post(boss.create)
    .delete(boss.delete);

router.route('/admin/:accessToken/user/:userId/image/:fileName')
    .get(image.get);

module.exports = router;