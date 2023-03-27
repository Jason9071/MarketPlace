const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

module.exports.mongoose = mongoose;
module.exports.connectionConfig = process.env.MONGO_PATH;

module.exports.adminSchema = new Schema({
    id: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    pw: {
        type: String,
        required: true
    },
    accessToken: {
        type: String,
        required: true,
        index: true,
        unique: true,
        default: uuidv4(),
    },
    permissnion: {
        enum: ["admin", "boss"],
        type: String,
        required: true,
    },
    ban: {
        type: Boolean,
        required: true,
        default: false,
    },
    createAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updateAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, { strict: true, versionKey: false });

module.exports.userSchema = new Schema({
    id: {
        type: String,
        required: true,
        minLength: 6
    },
    pw: {
        type: String,
        required: true,
        minLength: 6
    },
    email: {
        type: String,
        required: true
    },
    realName: {
        type: String,
        required: true
    },
    credentialId: {
        type: String,
        required: true
    },
    accessToken: {
        type: String,
        required: true,
        index: true,
        unique: true,
        default: uuidv4(),
    },
    accessTokenExpiryTimestamp: {
        type: Number,
        required: true,
        default: 0,
    },
    image: {
        type: [{
            fileName: String,
            type: {
                enum: ["idcard", "credential"],
                type: String
            }
        }],
        _id : false
    },
    status: {
        enum: ["normal", "abnormal", "ban"],
        type: String,
        required: true,
        default: "normal",
    },
    review: {
        enum: ["needed", "waitting", "success", "fail"],
        type: String,
        required: true,
        default: "needed",
    },
    usdt: {
        type: Number,
        required: true,
        default: 0,
    },
    createAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updateAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, { strict: true, versionKey: false });

module.exports.orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    requested: {
        enum: ["in", "out"],
        type: String,
        required: true
    },
    from: {
        enum: ["USD", "TWD", "HKD", "USDT"],
        type: String,
        required: true,
    },
    to: {
        enum: ["USD", "TWD", "HKD", "USDT"],
        type: String,
        required: true,
    },
    depositOrWithdraw: {
        type: {
            bank: {
                type: String,
                required: true
            },
            branch: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            account: {
                type: String,
                required: true
            },
        },
        _id : false
    },
    bkIn: {
        type: {
            bankId: {
                type: String,
                required: true
            },
            transactionId: {
                type: String,
                required: true
            },
            fileName: {
                type: String,
                required: true
            }
        }
    },
    bcIn: {
        type: {
            address: {
                type: String,
                required: true
            },
            chain: {
                enum: ["ERC20", "BEP20", "TRC20"],
                type: String,
                required: true
            },
            fee: {
                type: Number,
                required: true
            }
        }
    },
    bkOut: {
        type: {
            bankId: {
                type: String,
                required: true
            },
            transactionId: {
                type: String,
                required: true
            },
            fee: {
                type: Number,
                required: true
            }
        }
    },
    bcOut: {
        type: {
            address: {
                type: String,
                required: true
            },
            chain: {
                enum: ["ERC20", "BEP20", "TRC20"],
                type: String,
                required: true
            },
            fee: {
                type: Number,
                required: true
            }
        }
    },
    amount: {
        type: Number,
        required: true,
        default: 0,
    },
    rate: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        enum: ["requested", "success", "fail"],
        type: String,
        required: true,
        default: "requested",
    },
    createAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updateAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, { strict: false, versionKey: false });

module.exports.depositSchema = new Schema({
    bank: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    account: {
        type: String,
        required: true
    },
    currency: {
        enum: ["USD", "TWD", "HKD", "RMB"],
        type: String,
        required: true
    },
    status: {
        enum: ["on", "off"],
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updateAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, { strict: true, versionKey: false });