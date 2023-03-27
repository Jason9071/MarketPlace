const { v4: uuidv4 } = require('uuid');
const fsp = require("fs/promises");
const fs = require("fs");
const mimeTypes = require('mimetypes');
const { mongoose, connectionConfig, userSchema } = require('../../models');

exports.login = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { id, pw } = req.body;

        const currentTimestamp = Math.round(Date.now() / 1000);

        const User = conn.model('User', userSchema);

        let newAccessToken = uuidv4();
        let accessTokenExist = await User.findOne({ accessToken: newAccessToken });

        while (accessTokenExist !== null) {
            newAccessToken = uuidv4();
            accessTokenExist = await User.findOne({ accessToken: newAccessToken });
        }

        const user = await User.findOneAndUpdate({ id, pw, status: { "$in": ["normal", "abnormal"] }, accessTokenExpiryTimestamp: { "$gte": currentTimestamp } }, { accessToken: newAccessToken, accessTokenExpiryTimestamp: currentTimestamp + 2592000, updateAt: new Date })
            .select({ _id: 0, id: 1, image: 1, status: 1, review: 1, usdt: 1, accessToken: 1 });

        if (user === null) {
            res.status(403).json({ "message": "unfound user or access token expiry", "data": {} });
            return;
        }

        user.accessToken = newAccessToken;

        res.status(200).json({ "message": "ok", "data": { user } });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
    } finally {
        await conn.destroy();
        return;
    }
}

exports.create = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { id, pw, email, realName, credentialId, idCardBase64, passportBase64 } = req.body;

        const currentTimestamp = Math.round(Date.now() / 1000);

        const User = conn.model('User', userSchema);

        const idExist = await User.findOne({ id });

        if (idExist !== null) {
            res.status(403).json({ "message": "id already used", "data": {} });
            return;
        }

        const newUser = {
            id,
            pw,
            email,
            realName,
            credentialId,
            accessToken: uuidv4(),
            accessTokenExpiryTimestamp: Math.round(Date.now() / 1000) + 2592000
        }

        let accessTokenExist = await User.findOne({ accessToken: newUser.accessToken });

        while (accessTokenExist !== null) {
            newUser.accessToken = uuidv4();
            accessTokenExist = await User.findOne({ accessToken: newUser.accessToken });
        }

        await User.create(newUser);

        const idCard = idCardBase64,
            idCardMimeType = idCard.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1],
            idCardFilePath = "users/" + String(newUser.id) + "/",
            idCardFileName = "idcard_" + String(currentTimestamp) + "." + mimeTypes.detectExtension(idCardMimeType),
            idCardBase64EncodedImageString = idCard.replace(/^data:image\/\w+;base64,/, ''),
            idCardBuffer = Buffer.from(idCardBase64EncodedImageString, 'base64')

        const idCardPath = process.env.FILE_PATH + idCardFilePath;
        const idCardPathWithFileName = idCardPath + idCardFileName;

        if (!fs.existsSync(idCardPath)) {
            await fsp.mkdir(idCardPath);
        }

        await fsp.writeFile(idCardPathWithFileName, idCardBuffer);

        await User.findOneAndUpdate({ accessToken: newUser.accessToken, status: { "$in": ["normal", "abnormal"] }, accessTokenExpiryTimestamp: { "$gte": currentTimestamp } }, { "$push": { image: { fileName: idCardFileName, type: "idcard" } }, updateAt: new Date });

        const passport = passportBase64,
            passportMimeType = passport.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1],
            passportFilePath = "users/" + String(newUser.id) + "/",
            passportFileName = "credential_" + String(currentTimestamp) + "." + mimeTypes.detectExtension(passportMimeType),
            passportBase64EncodedImageString = passport.replace(/^data:image\/\w+;base64,/, ''),
            passportBuffer = Buffer.from(passportBase64EncodedImageString, 'base64')

        const passportPath = process.env.FILE_PATH + passportFilePath;
        const passportPathWithFileName = passportPath + passportFileName;


        if (!fs.existsSync(passportPath)) {
            await fsp.mkdir(passportPath);
        }

        await fsp.writeFile(passportPathWithFileName, passportBuffer);

        await User.findOneAndUpdate({ accessToken: newUser.accessToken, status: { "$in": ["normal", "abnormal"] }, accessTokenExpiryTimestamp: { "$gte": currentTimestamp } }, { "$push": { image: { fileName: passportFileName, type: "credential" } }, updateAt: new Date });

        await conn.destroy();

        res.status(200).json({ "message": "ok", "data": { accessToken: newUser.accessToken } });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
    } finally {
        await conn.destroy();
        return;
    }
}

exports.get = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { accessToken } = req.params;

        const currentTimestamp = Math.round(Date.now() / 1000);

        const User = conn.model('User', userSchema);

        const user = await User.findOne({ accessToken, status: { "$in": ["normal", "abnormal"] }, accessTokenExpiryTimestamp: { "$gte": currentTimestamp } })
            .select({ _id: 0, id: 1, image: 1, status: 1, review: 1, usdt: 1, accessToken: 1 });

        if (user === null) {
            res.status(403).json({ "message": "unfound user", "data": {} });
            return;
        }

        res.status(200).json({ "message": "ok", "data": { user } });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });

    } finally {
        await conn.destroy();
        return;
    }
}

exports.update = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { accessToken } = req.params;
        const { pw } = req.body;

        const User = conn.model('User', userSchema);

        await User.findOneAndUpdate({ accessToken }, { pw, updateAt: new Date });

        res.status(200).json({ "message": "ok", "data": {} });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
    } finally {
        await conn.destroy();
        return ;
    }
}