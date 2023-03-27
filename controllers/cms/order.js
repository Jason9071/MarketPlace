const { mongoose, connectionConfig, adminSchema, userSchema, orderSchema } = require('../../models');

exports.getAll = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { skip, limit, status } = req.query;
        const { accessToken } = req.params;

        const Admin = conn.model('Admin', adminSchema);
        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const User = conn.model('User', userSchema);
        const Order = conn.model('Order', orderSchema);

        if (status === undefined) {
            const orders = await Order.find()
                .skip(skip)
                .limit(limit)
                .sort({ createAt: -1 })
                .populate('user', { _id: 0, id: 1 });

            res.status(200).json({ "message": "ok", "data": { orders } });
        } else {
            const orders = await Order.find({ status })
                .skip(skip)
                .limit(limit)
                .sort({ createAt: -1 })
                .populate('user', { _id: 0, id: 1 });

            res.status(200).json({ "message": "ok", "data": { orders } });
        }


    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    } finally {
        await conn.destroy();
        return;
    }
}

exports.update = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { accessToken } = req.params;
        const { orderObjectId, status } = req.body;

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

        res.status(200).json({ "message": "ok", "data": {} });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    } finally {
        await conn.destroy();
        return;
    }
}