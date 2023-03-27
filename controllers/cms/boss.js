const { v4: uuidv4 } = require('uuid');
const { mongoose, connectionConfig, adminSchema } = require('../../models');

exports.get = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { skip, limit } = req.query;
        const { accessToken, amdminId } = req.params;

        const Admin = conn.model('Admin', adminSchema);
        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const admin = await Admin.findOne( { id : amdminId } )
            .select({ _id: 0, accessToken: 0 });

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

exports.getAll = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { skip, limit } = req.query;
        const { accessToken } = req.params;

        const Admin = conn.model('Admin', adminSchema);
        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const admins = await Admin.find()
            .skip(skip)
            .limit(limit)
            .select({ _id: 0, accessToken: 0 });

        res.status(200).json({ "message": "ok", "data": { admins } });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    } finally {
        await conn.destroy();
        return;
    }
}

exports.create = async (req, res) => {
    const conn = mongoose.createConnection(connectionConfig);
    try {
        const { accessToken } = req.params;
        const { id, pw, permissnion } = req.body;

        const Admin = conn.model('Admin', adminSchema);

        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        const idExist = await Admin.findOne({ id });

        if (idExist !== null) {
            res.status(403).json({ "message": "id already used", "data": {} });
            return;
        }

        const newAdmin = {
            id,
            pw,
            accessToken: uuidv4(),
            permissnion
        }

        let accessTokenExist = await Admin.findOne({ accessToken: newAdmin.accessToken });

        while (accessTokenExist !== null) {
            newAdmin.accessToken = uuidv4();
            accessTokenExist = await Admin.findOne({ accessToken: newAdmin.accessToken });
        }

        const admin = await Admin.create(newAdmin);

        await conn.destroy();

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
        const { id, pw, ban } = req.body;

        const conn = mongoose.createConnection(connectionConfig);
        const Admin = conn.model('Admin', adminSchema);

        const boss = await Admin.findOne({ accessToken, ban: false, permissnion: "boss" });

        if (boss === null) {
            res.status(403).json({ "message": "unfound admin or permission denied", "data": {} });
            return;
        }

        await Admin.findOneAndUpdate({ id }, { pw, ban, updateAt: new Date });

        await conn.destroy();

        res.status(200).json({ "message": "ok", "data": {} });
        return;
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "internal server error" });
        return;
    }
}