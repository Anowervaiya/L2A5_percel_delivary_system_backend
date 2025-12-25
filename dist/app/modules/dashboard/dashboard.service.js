"use strict";
// services/dashboard.service.ts
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
exports.dashboardService = void 0;
const percel_model_1 = require("../percel/percel.model");
const percel_interface_1 = require("../percel/percel.interface");
const user_model_1 = require("../user/user.model");
// ============= SENDER DASHBOARD METHODS =============
const getSenderStats = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = user === null || user === void 0 ? void 0 : user.email;
    // Total parcels
    const totalParcels = yield percel_model_1.Parcel.countDocuments({ sender: userEmail });
    // Status-wise count
    const requested = yield percel_model_1.Parcel.countDocuments({
        sender: userEmail,
        currentStatus: percel_interface_1.ParcelStatus.REQUESTED,
    });
    const inTransit = yield percel_model_1.Parcel.countDocuments({
        sender: userEmail,
        currentStatus: percel_interface_1.ParcelStatus.IN_TRANSIT,
    });
    const delivered = yield percel_model_1.Parcel.countDocuments({
        sender: userEmail,
        currentStatus: percel_interface_1.ParcelStatus.DELIVERED,
    });
    // Monthly volume (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyDataRaw = yield percel_model_1.Parcel.aggregate([
        {
            $match: {
                sender: userEmail,
                createdAt: { $gte: sixMonthsAgo },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 },
        },
    ]);
    // ✅ Format করা - Frontend এর জন্য ready
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthlyData = monthlyDataRaw.map(item => ({
        month: monthNames[item._id.month - 1], // 1 → "January"
        parcels: item.count
    }));
    // Status distribution
    const statusDistributionRaw = yield percel_model_1.Parcel.aggregate([
        { $match: { sender: userEmail } },
        {
            $group: {
                _id: '$currentStatus',
                count: { $sum: 1 },
            },
        },
    ]);
    // ✅ Status distribution ও format করা
    const statusDistribution = statusDistributionRaw.map(item => {
        var _a;
        return ({
            name: (_a = item === null || item === void 0 ? void 0 : item._id) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
            value: item.count,
        });
    });
    return {
        totalParcels,
        requested,
        inTransit,
        delivered,
        monthlyData, // ✅ Already formatted: [{ month: "July", parcels: 240 }]
        statusDistribution, // ✅ Already formatted: [{ name: "DELIVERED", value: 10 }]
    };
});
const getSenderParcels = (user, query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, status, search } = query;
    const userEmail = user === null || user === void 0 ? void 0 : user.email;
    const filter = { sender: userEmail };
    if (status)
        filter.currentStatus = status;
    if (search)
        filter.trackingId = { $regex: search, $options: 'i' };
    const parcels = yield percel_model_1.Parcel.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);
    const total = yield percel_model_1.Parcel.countDocuments(filter);
    return {
        data: parcels,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
});
// ============= RECEIVER DASHBOARD METHODS =============
const getReceiverDashboardStats = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = user === null || user === void 0 ? void 0 : user.email;
    // Incoming parcels (In Transit + Dispatched)
    const incomingParcels = yield percel_model_1.Parcel.countDocuments({
        receiver: userEmail,
        currentStatus: {
            $in: [percel_interface_1.ParcelStatus.IN_TRANSIT, percel_interface_1.ParcelStatus.DISPATCHED, percel_interface_1.ParcelStatus.APPROVED]
        },
    });
    // Delivered this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const deliveredThisMonth = yield percel_model_1.Parcel.countDocuments({
        receiver: userEmail,
        currentStatus: percel_interface_1.ParcelStatus.DELIVERED,
        updatedAt: { $gte: startOfMonth },
    });
    // Pending confirmation
    const pendingConfirmation = yield percel_model_1.Parcel.countDocuments({
        receiver: userEmail,
        currentStatus: percel_interface_1.ParcelStatus.REQUESTED,
    });
    // Total received
    const totalReceived = yield percel_model_1.Parcel.countDocuments({
        receiver: userEmail,
    });
    // Delivery trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const deliveryTrendRaw = yield percel_model_1.Parcel.aggregate([
        {
            $match: {
                receiver: userEmail,
                currentStatus: percel_interface_1.ParcelStatus.DELIVERED,
                updatedAt: { $gte: twelveMonthsAgo },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$updatedAt' },
                    month: { $month: '$updatedAt' },
                },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 },
        },
    ]);
    // Format delivery trend
    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const deliveryTrend = deliveryTrendRaw.map((item) => ({
        month: monthNames[item._id.month - 1],
        deliveries: item.count,
    }));
    // Location distribution (top 5 delivery addresses)
    const locationDistributionRaw = yield percel_model_1.Parcel.aggregate([
        {
            $match: {
                receiver: userEmail,
                currentStatus: percel_interface_1.ParcelStatus.DELIVERED,
            },
        },
        {
            $group: {
                _id: '$deliveryLocation',
                count: { $sum: 1 },
            },
        },
        {
            $sort: { count: -1 },
        },
        {
            $limit: 5,
        },
    ]);
    const totalDeliveries = locationDistributionRaw.reduce((sum, item) => sum + item.count, 0);
    const locationDistribution = locationDistributionRaw.map((item) => ({
        name: item._id || 'Unknown',
        value: Math.round((item.count / totalDeliveries) * 100),
    }));
    return {
        incomingParcels,
        deliveredThisMonth,
        pendingConfirmation,
        totalReceived,
        deliveryTrend,
        locationDistribution,
    };
});
const getIncomingParcels = (user, params) => __awaiter(void 0, void 0, void 0, function* () {
    const userEmail = user === null || user === void 0 ? void 0 : user.email;
    const { page = 1, limit = 10, status, search } = params;
    const query = { receiver: userEmail };
    if (status && status !== 'all') {
        query.currentStatus = status.toUpperCase();
    }
    if (search) {
        query.$or = [
            { trackingId: { $regex: search, $options: 'i' } },
            { sender: { $regex: search, $options: 'i' } },
        ];
    }
    const parcels = yield percel_model_1.Parcel.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
    const total = yield percel_model_1.Parcel.countDocuments(query);
    return {
        parcels,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        },
    };
});
// ============= ADMIN DASHBOARD METHODS =============
const getAdminOverviewStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Total parcels
    const totalParcels = yield percel_model_1.Parcel.countDocuments();
    const totalUsers = yield user_model_1.User.countDocuments();
    // Pending deliveries
    const pendingDeliveries = yield percel_model_1.Parcel.countDocuments({
        currentStatus: { $in: [percel_interface_1.ParcelStatus.APPROVED, percel_interface_1.ParcelStatus.IN_TRANSIT] }
    });
    // Revenue this month (sum of fees from delivered parcels)
    const revenueThisMonthData = yield percel_model_1.Parcel.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfMonth },
                currentStatus: percel_interface_1.ParcelStatus.DELIVERED
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$fee' }
            }
        }
    ]);
    const currentRevenue = ((_a = revenueThisMonthData[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    return {
        totalParcels,
        totalUsers,
        pendingDeliveries,
        revenueThisMonth: currentRevenue
    };
});
const getAdminParcelTrends = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (days = 90) {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const trends = yield percel_model_1.Parcel.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    status: '$currentStatus'
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.date': 1 }
        }
    ]);
    // Transform data
    const dataMap = new Map();
    trends.forEach(item => {
        const date = item._id.date;
        if (!dataMap.has(date)) {
            dataMap.set(date, {
                day: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                delivered: 0,
                transit: 0,
                pending: 0
            });
        }
        const data = dataMap.get(date);
        if (item._id.status === percel_interface_1.ParcelStatus.DELIVERED)
            data.delivered = item.count;
        else if (item._id.status === percel_interface_1.ParcelStatus.IN_TRANSIT)
            data.transit = item.count;
        else if (item._id.status === percel_interface_1.ParcelStatus.REQUESTED)
            data.pending = item.count;
    });
    return Array.from(dataMap.values());
});
const getAdminDistrictDistribution = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10) {
    const distribution = yield percel_model_1.Parcel.aggregate([
        {
            $group: {
                _id: {
                    district: '$deliveryLocation', // Adjust field name as per your schema
                    status: '$currentStatus'
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.district',
                delivered: {
                    $sum: {
                        $cond: [{ $eq: ['$_id.status', percel_interface_1.ParcelStatus.DELIVERED] }, '$count', 0]
                    }
                },
                transit: {
                    $sum: {
                        $cond: [{ $eq: ['$_id.status', percel_interface_1.ParcelStatus.IN_TRANSIT] }, '$count', 0]
                    }
                },
                pending: {
                    $sum: {
                        $cond: [{ $eq: ['$_id.status', percel_interface_1.ParcelStatus.REQUESTED] }, '$count', 0]
                    }
                },
                total: { $sum: '$count' }
            }
        },
        {
            $sort: { total: -1 }
        },
        {
            $limit: limit
        },
        {
            $project: {
                _id: 0,
                district: '$_id',
                delivered: 1,
                transit: 1,
                pending: 1
            }
        }
    ]);
    return distribution;
});
const getAdminRevenueGrowth = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (months = 12) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Get revenue data from delivered parcels
    const revenueData = yield percel_model_1.Parcel.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                currentStatus: percel_interface_1.ParcelStatus.DELIVERED
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                revenue: { $sum: '$fee' }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ]);
    // Create array of all months
    const result = [];
    for (let i = 0; i < months; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
        const monthData = revenueData.find(d => d._id.year === date.getFullYear() && d._id.month === date.getMonth() + 1);
        result.push({
            month: monthNames[date.getMonth()],
            revenue: (monthData === null || monthData === void 0 ? void 0 : monthData.revenue) || 0
        });
    }
    // Calculate projection
    const historicalRevenues = result.filter(r => r.revenue && r.revenue > 0);
    if (historicalRevenues.length >= 3) {
        const avgGrowth = historicalRevenues.reduce((acc, curr, idx) => {
            if (idx === 0)
                return 0;
            return acc + (curr.revenue - historicalRevenues[idx - 1].revenue);
        }, 0) / (historicalRevenues.length - 1);
        const lastRevenue = historicalRevenues[historicalRevenues.length - 1].revenue;
        result.forEach((item, idx) => {
            if (!item.revenue || item.revenue === 0) {
                const monthsAhead = idx - historicalRevenues.length + 1;
                item.projection = Math.round(lastRevenue + (avgGrowth * monthsAhead));
            }
            else {
                item.projection = item.revenue;
            }
        });
    }
    return result;
});
const getAdminSystemMetrics = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Average delivery time (based on statusLogs)
    const deliveredParcels = yield percel_model_1.Parcel.find({
        currentStatus: percel_interface_1.ParcelStatus.DELIVERED,
    }).select('createdAt statusLogs');
    let totalDeliveryTime = 0;
    let validDeliveries = 0;
    deliveredParcels.forEach(parcel => {
        var _a;
        const deliveredLog = (_a = parcel.statusLogs) === null || _a === void 0 ? void 0 : _a.find(log => log.status === percel_interface_1.ParcelStatus.DELIVERED);
        if (deliveredLog) {
            const deliveryTime = deliveredLog.timestamp.getTime() - parcel.createdAt.getTime();
            totalDeliveryTime += deliveryTime;
            validDeliveries++;
        }
    });
    const avgDeliveryTimeMs = validDeliveries > 0 ? totalDeliveryTime / validDeliveries : 0;
    const avgDeliveryDays = (avgDeliveryTimeMs / (1000 * 60 * 60 * 24)).toFixed(1);
    // Success rate
    const totalParcels = yield percel_model_1.Parcel.countDocuments();
    const successfulDeliveries = yield percel_model_1.Parcel.countDocuments({
        currentStatus: percel_interface_1.ParcelStatus.DELIVERED
    });
    const successRate = totalParcels > 0
        ? ((successfulDeliveries / totalParcels) * 100).toFixed(1)
        : '0';
    // Peak hours
    const hourlyDistribution = yield percel_model_1.Parcel.aggregate([
        {
            $group: {
                _id: { $hour: '$createdAt' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 1
        }
    ]);
    const peakHour = ((_a = hourlyDistribution[0]) === null || _a === void 0 ? void 0 : _a._id) || 14;
    const peakHours = `${peakHour % 12 || 12}-${(peakHour + 2) % 12 || 12} ${peakHour >= 12 ? 'PM' : 'AM'}`;
    // Active users now
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeNow = yield user_model_1.User.countDocuments({
        lastLoginAt: { $gte: oneHourAgo }
    });
    return {
        avgDeliveryTime: `${avgDeliveryDays} days`,
        successRate: `${successRate}%`,
        peakHours,
        activeNow
    };
});
exports.dashboardService = {
    //sender methods
    getSenderStats,
    getSenderParcels,
    // Receiver methods
    getReceiverDashboardStats,
    getIncomingParcels,
    // Admin methods
    getAdminOverviewStats,
    getAdminParcelTrends,
    getAdminDistrictDistribution,
    getAdminRevenueGrowth,
    getAdminSystemMetrics
};
