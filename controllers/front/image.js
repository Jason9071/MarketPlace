const fs = require("fs");
const { mongoose, connectionConfig, userSchema } = require('../../models');

exports.get = async (req, res) => {
    try {
        const { accessToken, fileName } = req.params;

        const currentTimestamp = Math.round(Date.now() / 1000);

        const conn = mongoose.createConnection(connectionConfig);
        const User = conn.model('User', userSchema);

        const user = await User.findOne({ accessToken, status: { "$in": ["normal", "abnormal"] }, accessTokenExpiryTimestamp: { "$gte": currentTimestamp } })
            .select({ _id: 1, id: 1 });

        if (user === null) {
            res.status(403).json({ "message": "unfound user", "data": {} });
            return;
        }

        imagePathWithFileName = process.env.FILE_PATH + "users/" + user.id + "/" + fileName;

        if (!fs.existsSync(imagePathWithFileName)) {
            res.status(403).json({ "message": "unfound image", "data": {} });
            return;
        }

        res.sendFile(imagePathWithFileName);

        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}