"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interfaces_1 = require("./user.interfaces");
const authProviderSchema = new mongoose_1.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
}, {
    versionKey: false,
    _id: false,
});
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(user_interfaces_1.Role),
        default: user_interfaces_1.Role.SENDER
    },
    isBlock: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    auths: [authProviderSchema],
}, {
    timestamps: true,
    versionKey: false,
});
exports.User = (0, mongoose_1.model)('User', userSchema);
