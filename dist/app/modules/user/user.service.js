"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const env_1 = require("../../config/env");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const user_interfaces_1 = require("./user.interfaces");
const user_model_1 = require("./user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = payload, rest = __rest(payload, ["email", "password", "role"]);
    const capitalizedRole = role === null || role === void 0 ? void 0 : role.toUpperCase();
    if (capitalizedRole === user_interfaces_1.Role.ADMIN) {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "you can't register as a admin , please register as a sender or reciever");
    }
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, 'User Already Exist');
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const authProvider = {
        provider: 'credentials',
        providerId: email,
    };
    const user = yield user_model_1.User.create(Object.assign({ email, password: hashedPassword, auths: [authProvider], role: capitalizedRole }, rest));
    return user;
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({});
    const totalUsers = yield user_model_1.User.countDocuments();
    return {
        data: users,
        meta: {
            total: totalUsers,
        },
    };
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('-password');
    return {
        data: user,
    };
});
const blockUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(payload.id);
    if (!user) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, 'user does not exist');
    }
    if (user.isBlock === payload.isBlock) {
        throw new appError_1.default(403, `user is already ${user.isBlock === true ? 'blocked' : 'unblock'}`);
    }
    if (user.role === user_interfaces_1.Role.ADMIN) {
        throw new appError_1.default(403, `you can't block or unblock an admin`);
    }
    const changableUser = yield user_model_1.User.findByIdAndUpdate(payload.id, {
        $set: {
            isBlock: payload.isBlock,
        },
    }, { new: true, runValidators: true });
    return changableUser;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, 'user does not exist');
    }
    const result = yield user_model_1.User.findOneAndDelete({ _id: id });
    return result;
});
exports.UserServices = {
    createUser,
    getAllUsers,
    blockUser,
    deleteUser,
    getMe,
};
