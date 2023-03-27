const { mongoose, connectionConfig, adminSchema, userSchema } = require('../../models');

exports.getAll = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { skip, limit } = req.query;
        const { accessToken } = req.params;

        const Admin = conn.model('Admin', adminSchema);
        const boss = await Admin.findOne({ accessToken, ban : false, permissnion : "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const User = conn.model('User', userSchema);

        const users = await User.find().skip(skip).limit(limit);

        res.status(200).json({ "message": "ok", "data": { users } });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    } finally {
        await conn.destroy();
        return;
    }
}

exports.get = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { accessToken, id } = req.params;

        const Admin = conn.model('Admin', adminSchema);
        const boss = await Admin.findOne({ accessToken, ban : false, permissnion : "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const User = conn.model('User', userSchema);

        const user = await User.findOne({id});

        res.status(200).json({ "message": "ok", "data": { user } });
        return;
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
        const { id, status, review, usdt } = req.body;

        const Admin = conn.model('Admin', adminSchema);

        const boss = await Admin.findOne({ accessToken, ban : false, permissnion : "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const User = conn.model('User', userSchema);

        await User.findOneAndUpdate({ id }, { status, review, usdt, updateAt : new Date });

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