const { mongoose, connectionConfig, adminSchema } = require('../../models');

exports.login = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { id, pw } = req.body;

        const Admin = conn.model('Admin', adminSchema);
        const admin = await Admin.findOne({ id, pw, ban: false });

        if (admin === null) {
            res.status(403).json({ "message": "unfound admin", "data": {} });
            return;
        }

        res.status(200).json({ "message": "ok", "data": { admin } });
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
        const { accessToken } = req.params;

        const Admin = conn.model('Admin', adminSchema);
        const admin = await Admin.findOne({ accessToken, ban: false })
            .select({ _id: 0 });

        if (admin === null) {
            res.status(403).json({ "message": "unfound admin", "data": {} });
            return;
        }

        res.status(200).json({ "message": "ok", "data": { admin } });
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
    try {
        const { accessToken } = req.params;
        const { pw } = req.body;

        const conn = mongoose.createConnection(connectionConfig);
        const Admin = conn.model('Admin', adminSchema);

        await Admin.findOneAndUpdate({ accessToken, ban: false }, { pw, updateAt: new Date });

        await conn.destroy();

        res.status(200).json({ "message": "ok", "data": {} });
        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}