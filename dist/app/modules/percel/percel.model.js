"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcel = void 0;
const mongoose_1 = require("mongoose");
const percel_interface_1 = require("./percel.interface");
const percel_constant_1 = require("./percel.constant");
const statusLogSchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    location: { type: String },
    note: { type: String },
}, { _id: false });
const parcelSchema = new mongoose_1.Schema({
    trackingId: { type: String, unique: true, required: true },
    type: { type: String, required: true },
    weight: { type: Number, required: true },
    fee: { type: Number, default: 130 },
    sender: { type: String, ref: 'User', required: true },
    receiver: { type: String, ref: 'User', required: true },
    deliveryLocation: {
        type: String,
        enum: Object.values(percel_constant_1.BangladeshDivision),
        required: true,
    },
    deliveryAddress: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    currentStatus: { type: String, default: percel_interface_1.ParcelStatus.REQUESTED },
    statusLogs: [statusLogSchema],
    isBlocked: { type: Boolean, default: false },
    isCancelled: { type: Boolean, default: false },
}, {
    timestamps: true, // ✅ এটা add করুন
    versionKey: false,
});
exports.Parcel = (0, mongoose_1.model)('Parcel', parcelSchema);
