const { mongoose, connectionConfig, adminSchema, userSchema, orderSchema } = require('../../models');

exports.get = async (req, res) => {
    try {
        const { skip, limit, status } = req.query;
        const { accessToken } = req.params;

        const conn = mongoose.createConnection(connectionConfig);
        const Admin = conn.model('Admin', adminSchema);
        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const User = conn.model('User', userSchema);
        const Order = conn.model('Order', orderSchema);
        const orders = await Order.find({ status })
            .skip(skip)
            .limit(limit)
            .populate('user', { _id: 0, id: 1 })
            .select({ _id: 0 });

        res.status(200).json({ "message": "ok", "data": { orders } });
        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}

exports.update = async (req, res) => {
    try {
        const { accessToken } = req.params;
        const { orderObjectId, status } = req.body;

        const conn = mongoose.createConnection(connectionConfig);
        const Admin = conn.model('Admin', adminSchema);

        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const Order = conn.model('Order', orderSchema);

        const order = await Order.findOneAndUpdate({ _id: orderObjectId, status: "requested" }, { status, updateAt: new Date });

        if (order === null) {
            res.status(403).json({ "message": "unfound order", "data": {} });
            return;
        }

        if (status === "fail") {
            res.status(200).json({ "message": "ok", "data": {} });
            return;
        }

        const User = conn.model('User', userSchema);

        if (order.requested === "in") {
            await User.findByIdAndUpdate({ _id: order.user }, { "$inc": { usdt: order.amount } });
        }
        else {
            await User.findByIdAndUpdate({ _id: order.user }, { "$inc": { usdt: order.amount * -1 } });
        }

        await conn.destroy();
        res.status(200).json({ "message": "ok", "data": {} });
        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}