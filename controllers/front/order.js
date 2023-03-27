const fsp = require("fs/promises");
const fs = require("fs");
const mimeTypes = require('mimetypes');
const { mongoose, connectionConfig, userSchema, orderSchema, depositSchema } = require('../../models');

exports.inBk = async (req, res) => {
    try {
        const { accessToken } = req.params;
        const { bankId, transactionId, transactionBase64, amount, from } = req.body;

        if (from !== "HKD" && from !== "TWD" && from !== "USD") {
            res.status(403).json({ "message": "deposit pairs are not supported", "data": {} });
            return;
        }

        const currentTimestamp = Math.round(Date.now() / 1000);

        const conn = mongoose.createConnection(connectionConfig);
        const User = conn.model('User', userSchema);

        const user = await User.findOne({ accessToken, status: { "$in": ["normal", "abnormal"] }, accessTokenExpiryTimestamp: { "$gte": currentTimestamp } })
            .select({ _id: 1, id: 1 });

        if (user === null) {
            res.status(403).json({ "message": "unfound user", "data": {} });
            return;
        }

        const Deposit = conn.model('Deposit', depositSchema);

        const deposit = await Deposit.findOne({ currency: from, status: "on" })
            .select({ _id: 0, bank: 1, branch: 1, name: 1, account: 1 });

        if (deposit === null) {
            res.status(403).json({ "message": "deposit pairs are not supported", "data": {} });
            return;
        }

        const transaction = transactionBase64,
            transactionMimeType = transaction.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1],
            transactionFilePath = "users/" + String(user.id) + "/",
            transactionFileName = "transaction_" + String(currentTimestamp) + "." + mimeTypes.detectExtension(transactionMimeType),
            transactionBase64EncodedImageString = transaction.replace(/^data:image\/\w+;base64,/, ''),
            transactionBuffer = Buffer.from(transactionBase64EncodedImageString, 'base64')

        const transactionPath = process.env.FILE_PATH + transactionFilePath;
        const transactionPathWithFileName = transactionPath + transactionFileName;


        if (!fs.existsSync(transactionPath)) {
            await fsp.mkdir(transactionPath);
        }

        await fsp.writeFile(transactionPathWithFileName, transactionBuffer);

        const transferInfo = {
            bankId,
            transactionId,
            fileName: transactionFileName
        }

        const Order = conn.model('Order', orderSchema);
        await Order.create({ user: user._id, from, to: "USDT", amount, requested: "in", transferInfo, depositOrWithdraw: deposit });

        await conn.destroy();

        res.status(200).json({ "message": "ok", "data": {} });
        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}

exports.outBk = async (req, res) => {
    try {
        const { accessToken } = req.params;
        const { bankId, transactionId, amount, to } = req.body;

        if (from !== "HKD" && from !== "TWD" && from !== "USD") {
            res.status(403).json({ "message": "deposit pairs are not supported", "data": {} });
            return;
        }

        const currentTimestamp = Math.round(Date.now() / 1000);

        const conn = mongoose.createConnection(connectionConfig);
        const User = conn.model('User', userSchema);

        const user = await User.findOne({ accessToken, status: { "$in": ["normal", "abnormal"] }, accessTokenExpiryTimestamp: { "$gte": currentTimestamp } })
            .select({ _id: 1, id: 1 });

        if (user === null) {
            res.status(403).json({ "message": "unfound user", "data": {} });
            return;
        }

        const Deposit = conn.model('Deposit', depositSchema);

        const deposit = await Deposit.findOne({ currency: to, status: "on" })
            .select({ _id: 0, bank: 1, branch: 1, name: 1, account: 1 });

        if (deposit === null) {
            res.status(403).json({ "message": "deposit pairs are not supported", "data": {} });
            return;
        }

        const transferInfo = {
            bankId,
            transactionId,
            fee: process.env.FEE
        }

        const Order = conn.model('Order', orderSchema);
        await Order.create({ user: user._id, from: "USDT", to, amount, requested: "out", transferInfo, depositOrWithdraw: deposit });

        await conn.destroy();

        res.status(200).json({ "message": "ok", "data": {} });
        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}

exports.outBc = async (req, res) => {
    try {
        const { accessToken } = req.params;
        const { address, chain, amount } = req.body;

        const currentTimestamp = Math.round(Date.now() / 1000);

        const conn = mongoose.createConnection(connectionConfig);
        const User = conn.model('User', userSchema);

        const user = await User.findOne({ accessToken, status: { "$in": ["normal", "abnormal"] }, accessTokenExpiryTimestamp: { "$gte": currentTimestamp } })
            .select({ _id: 1, id: 1 });

        if (user === null) {
            res.status(403).json({ "message": "unfound user", "data": {} });
            return;
        }

        const transferInfo = {
            address,
            chain,
            fee: process.env.FEE
        }

        const Order = conn.model('Order', orderSchema);
        await Order.create({ user: user._id, from: "USDT", to : "USDT", amount, requested: "out", transferInfo });

        await conn.destroy();

        res.status(200).json({ "message": "ok", "data": {} });
        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}

exports.get = async (req, res) => {
    try {
        const { skip, limit, requested } = req.query;
        const { accessToken } = req.params;

        const currentTimestamp = Math.round(Date.now() / 1000);

        const conn = mongoose.createConnection(connectionConfig);
        const User = conn.model('User', userSchema);

        const user = await User.findOne({ accessToken, status: { "$in": ["normal", "abnormal"] }, accessTokenExpiryTimestamp: { "$gte": currentTimestamp } })
            .select({ _id: 1 });

        if (user === null) {
            res.status(403).json({ "message": "unfound user", "data": {} });
            return;
        }

        const Order = conn.model('Order', orderSchema);

        const orders = await Order.find({ user: user._id, requested })
            .skip(skip)
            .limit(limit)
            .select({ _id: 0, from: 1, to: 1, requested: 1, amount: 1, status: 1, createAt: 1, transferInfo: 1, depositOrWithdraw: 1 })
            .sort({ createAt: -1 });


        res.status(200).json({ "message": "ok", "data": { orders } });
        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}