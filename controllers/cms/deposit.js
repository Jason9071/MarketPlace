const { mongoose, connectionConfig, adminSchema, depositSchema } = require('../../models');

exports.get = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { accessToken } = req.params;

        const Admin = conn.model('Admin', adminSchema);
        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const Deposit = conn.model('Deposit', depositSchema);
        const deposits = await Deposit.find();

        res.status(200).json({ "message": "ok", "data": { deposits } });
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
        const { depositObjectId, bank, branch, name, account, currency, status } = req.body;

        const Admin = conn.model('Admin', adminSchema);

        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const Deposit = conn.model('Deposit', depositSchema);
        await Deposit.findByIdAndUpdate({ _id: depositObjectId }, { bank, branch, name, account, currency, status, updateAt: new Date });

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