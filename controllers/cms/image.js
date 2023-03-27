const fs = require("fs");
const { mongoose, connectionConfig, adminSchema } = require('../../models');

exports.get = async (req, res) => {
    try {
        const { accessToken, userId, fileName } = req.params;

        const conn = mongoose.createConnection(connectionConfig);
        const Admin = conn.model('Admin', adminSchema);
        const admin = await Admin.findOne({ accessToken, ban : false });

        if (admin === null) {
            res.status(403).json({ "message": "unfound admin", "data": {} });
            return;
        }

        imagePathWithFileName = process.env.FILE_PATH + "users/" + userId + "/" + fileName;

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