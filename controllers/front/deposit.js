const { mongoose, connectionConfig, userSchema, depositSchema } = require('../../models');

exports.get = async (req, res) => {
    try {
        const { accessToken } = req.params;

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
        const deposits = await Deposit.find({ status : "on" })
            .select({ _id: 0, createAt: 0, updateAt: 0 });

        res.status(200).json({ "message": "ok", "data": { deposits } });
        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}