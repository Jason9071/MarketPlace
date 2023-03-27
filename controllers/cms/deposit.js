const { mongoose, connectionConfig, adminSchema, depositSchema } = require('../../models');

exports.get = async (req, res) => {
    try {
        const { accessToken } = req.params;

        const conn = mongoose.createConnection(connectionConfig);
        const Admin = conn.model('Admin', adminSchema);
        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const Deposit = conn.model('Deposit', depositSchema);
        const deposits = await Deposit.find()
            .select({ _id: 0});

        res.status(200).json({ "message": "ok", "data": { deposits } });
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
        const { depositObjectId, bank, branch, name, account, currency, status } = req.body;

        const conn = mongoose.createConnection(connectionConfig);
        const Admin = conn.model('Admin', adminSchema);

        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const Deposit = conn.model('Deposit', depositSchema);
        await Deposit.findByIdAndUpdate({ _id: depositObjectId }, { bank, branch, name, account, currency, status, updateAt: new Date });

        await conn.destroy();
        res.status(200).json({ "message": "ok", "data": {} });
        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}