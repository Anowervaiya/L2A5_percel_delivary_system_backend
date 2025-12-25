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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const percel_service_1 = require("./percel.service");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const parcel = yield percel_service_1.ParcelService.createParcel(user, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: 'parcel is created succesfully',
        data: parcel,
    });
}));
const cancelParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.params.id;
    const user = req.user;
    const parcel = yield percel_service_1.ParcelService.cancelParcel(Id, user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: 'parcel is cancelled succesfully',
        data: parcel,
    });
}));
const confirmParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.params.id;
    const user = req.user;
    const parcel = yield percel_service_1.ParcelService.confirmParcel(Id, user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: 'parcel is delivered succesfully',
        data: parcel,
    });
}));
const finterParcelByStatus = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    const result = yield percel_service_1.ParcelService.finterParcelByStatus(status);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: 'specifice parcel is retrieved succesfully',
        meta: result === null || result === void 0 ? void 0 : result.meta,
        data: result === null || result === void 0 ? void 0 : result.data,
    });
}));
const deleteParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.params.id;
    yield percel_service_1.ParcelService.deleteParcel(Id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: 'Parcel is deleted Successfully',
        data: null,
    });
}));
const changeParcelStatus = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const data = req.body;
    const payload = Object.assign(Object.assign({}, data), user);
    const parcel = yield percel_service_1.ParcelService.changeParcelStatus(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: 'parcel status is changed succesfully',
        data: parcel,
    });
}));
const myParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const parcel = yield percel_service_1.ParcelService.myParcel(user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: 'parcel retrieved succesfully',
        data: parcel,
    });
}));
const allParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 8, status, search } = req.query;
    const result = yield percel_service_1.ParcelService.allParcel({
        page: Number(page),
        limit: Number(limit),
        status: status,
        search: search,
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'All parcels retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const ParcelByTrackingId = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const trackingId = req.params.trackingId;
    const parcel = yield percel_service_1.ParcelService.ParcelByTrackingId(trackingId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.ACCEPTED,
        message: 'parcel retrieved succussfully',
        data: parcel,
    });
}));
exports.ParcelController = {
    createParcel,
    cancelParcel,
    changeParcelStatus,
    myParcel,
    ParcelByTrackingId,
    allParcel,
    confirmParcel,
    deleteParcel,
    finterParcelByStatus
};
