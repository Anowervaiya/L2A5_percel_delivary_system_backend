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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const sendResponse_1 = require("../../utils/sendResponse");
const catchAsync_1 = require("../../utils/catchAsync");
// Dashboard Controllers
const getSenderStats = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const stats = yield dashboard_service_1.dashboardService.getSenderStats(user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'sender stats retrieved successfully',
        data: stats,
    });
}));
const getSenderParcels = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { page = 1, limit = 10, status, search } = req.query;
    const result = yield dashboard_service_1.dashboardService.getSenderParcels(user, {
        page: Number(page),
        limit: Number(limit),
        status: status,
        search: search,
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'sender parcels retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const getReceiverStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user; // From auth middleware
    const stats = yield dashboard_service_1.dashboardService.getReceiverDashboardStats(user);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Receiver dashboard stats retrieved successfully',
        data: stats,
    });
}));
const getReceiverParcels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { page, limit, status, search } = req.query;
    const result = yield dashboard_service_1.dashboardService.getIncomingParcels(user, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status,
        search: search,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Incoming parcels retrieved successfully',
        data: result,
    });
}));
//Admin Dashboard
const getAdminOverview = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield dashboard_service_1.dashboardService.getAdminOverviewStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Admin overview stats retrieved successfully',
        data: stats,
    });
}));
const getParcelTrends = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { days } = req.query;
    const daysNumber = days ? Number(days) : 90;
    const trends = yield dashboard_service_1.dashboardService.getAdminParcelTrends(daysNumber);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Parcel trends retrieved successfully',
        data: trends,
    });
}));
const getDistrictDistribution = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit } = req.query;
    const limitNumber = limit ? Number(limit) : 10;
    const distribution = yield dashboard_service_1.dashboardService.getAdminDistrictDistribution(limitNumber);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'District distribution retrieved successfully',
        data: distribution,
    });
}));
const getRevenueGrowth = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { months } = req.query;
    const monthsNumber = months ? Number(months) : 12;
    const revenue = yield dashboard_service_1.dashboardService.getAdminRevenueGrowth(monthsNumber);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Revenue growth data retrieved successfully',
        data: revenue,
    });
}));
const getSystemMetrics = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const metrics = yield dashboard_service_1.dashboardService.getAdminSystemMetrics();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'System metrics retrieved successfully',
        data: metrics,
    });
}));
exports.dashboardController = {
    getSenderStats,
    getSenderParcels,
    getReceiverStats,
    getReceiverParcels,
    getAdminOverview,
    getParcelTrends,
    getDistrictDistribution,
    getRevenueGrowth,
    getSystemMetrics,
};
