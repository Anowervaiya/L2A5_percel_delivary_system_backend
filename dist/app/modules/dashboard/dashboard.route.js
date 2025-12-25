"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoute = void 0;
// routes/dashboard.routes.ts
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interfaces_1 = require("../user/user.interfaces");
const dashboard_controller_1 = require("./dashboard.controller");
const router = express_1.default.Router();
// =============  SENDER DASHBOARD ROUTES =============
router.get('/sender/stats', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.SENDER), dashboard_controller_1.dashboardController.getSenderStats);
router.get('/sender/parcels', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.SENDER, user_interfaces_1.Role.RECEIVER, user_interfaces_1.Role.ADMIN), dashboard_controller_1.dashboardController.getSenderParcels);
// ============= RECEIVER DASHBOARD ROUTES =============
// Receiver dashboard stats
router.get('/receiver/stats', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.RECEIVER), dashboard_controller_1.dashboardController.getReceiverStats);
// Get incoming parcels with filters
router.get('/receiver/parcels', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.RECEIVER), dashboard_controller_1.dashboardController.getReceiverParcels);
// ============= ADMIN DASHBOARD ROUTES =============
// Admin overview stats
router.get('/admin/overview', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.ADMIN), dashboard_controller_1.dashboardController.getAdminOverview);
// Parcel trends over time
router.get('/admin/trends', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.ADMIN), dashboard_controller_1.dashboardController.getParcelTrends);
// District-wise distribution
router.get('/admin/districts', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.ADMIN), dashboard_controller_1.dashboardController.getDistrictDistribution);
// Revenue growth data
router.get('/admin/revenue', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.ADMIN), dashboard_controller_1.dashboardController.getRevenueGrowth);
// System performance metrics
router.get('/admin/metrics', (0, checkAuth_1.checkAuth)(user_interfaces_1.Role.ADMIN), dashboard_controller_1.dashboardController.getSystemMetrics);
exports.dashboardRoute = router;
