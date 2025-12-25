// services/dashboard.service.ts

import { JwtPayload } from "jsonwebtoken";
import { Parcel } from "../percel/percel.model";
import { ParcelStatus } from "../percel/percel.interface";
import { User } from "../user/user.model";

// ============= RECEIVER DASHBOARD INTERFACES =============
interface MonthlyDataItem {
  month: string;
  deliveries: number;
}

interface LocationDataItem {
  name: string;
  value: number;
}

interface ReceiverDashboardStats {
  incomingParcels: number;
  deliveredThisMonth: number;
  pendingConfirmation: number;
  totalReceived: number;
  deliveryTrend: MonthlyDataItem[];
  locationDistribution: LocationDataItem[];
}

// ============= ADMIN DASHBOARD INTERFACES =============
interface OverviewStats {
  totalParcels: number;
  totalUsers: number;
  pendingDeliveries: number;
  revenueThisMonth: number;
}

interface ParcelTrendData {
  day: string;
  delivered: number;
  transit: number;
  pending: number;
}

interface DistrictData {
  district: string;
  delivered: number;
  transit: number;
  pending: number;
}

interface RevenueData {
  month: string;
  revenue?: number;
  projection?: number;
}

interface SystemMetrics {
  avgDeliveryTime: string;
  successRate: string;
  peakHours: string;
  activeNow: number;
}

// ============= SENDER DASHBOARD METHODS =============
const getSenderStats = async (user: JwtPayload) => {
  const userEmail = user?.email;

  // Total parcels
  const totalParcels = await Parcel.countDocuments({ sender: userEmail });

  // Status-wise count
  const requested = await Parcel.countDocuments({
    sender: userEmail,
    currentStatus: ParcelStatus.REQUESTED,
  });

  const inTransit = await Parcel.countDocuments({
    sender: userEmail,
    currentStatus: ParcelStatus.IN_TRANSIT,
  });

  const delivered = await Parcel.countDocuments({
    sender: userEmail,
    currentStatus: ParcelStatus.DELIVERED,
  });

  // Monthly volume (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyDataRaw = await Parcel.aggregate([
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
  const statusDistributionRaw = await Parcel.aggregate([
    { $match: { sender: userEmail } },
    {
      $group: {
        _id: '$currentStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  // ✅ Status distribution ও format করা
  const statusDistribution = statusDistributionRaw.map(item => ({
    name: item?._id?.toLowerCase(),
    value: item.count,
  }));

  return {
    totalParcels,
    requested,
    inTransit,
    delivered,
    monthlyData,        // ✅ Already formatted: [{ month: "July", parcels: 240 }]
    statusDistribution, // ✅ Already formatted: [{ name: "DELIVERED", value: 10 }]
  };
};

interface RecentsenderParcelsQuery {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

const getSenderParcels = async (user: JwtPayload, query: RecentsenderParcelsQuery) => {
  const { page, limit, status, search } = query;
  const userEmail = user?.email;

  const filter: any = { sender: userEmail };

  if (status) filter.currentStatus = status;
  if (search) filter.trackingId = { $regex: search, $options: 'i' };

  const parcels = await Parcel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await Parcel.countDocuments(filter);

  return {
    data: parcels,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};


// ============= RECEIVER DASHBOARD METHODS =============
const getReceiverDashboardStats = async (
  user: JwtPayload
): Promise<ReceiverDashboardStats> => {
  const userEmail = user?.email;

  // Incoming parcels (In Transit + Dispatched)
  const incomingParcels = await Parcel.countDocuments({
    receiver: userEmail,
    currentStatus: {
      $in: [ParcelStatus.IN_TRANSIT, ParcelStatus.DISPATCHED, ParcelStatus.APPROVED]
    },
  });

  // Delivered this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const deliveredThisMonth = await Parcel.countDocuments({
    receiver: userEmail,
    currentStatus: ParcelStatus.DELIVERED,
    updatedAt: { $gte: startOfMonth },
  });

  // Pending confirmation
  const pendingConfirmation = await Parcel.countDocuments({
    receiver: userEmail,
    currentStatus: ParcelStatus.REQUESTED,
  });

  // Total received
  const totalReceived = await Parcel.countDocuments({
    receiver: userEmail,
  });

  // Delivery trend (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const deliveryTrendRaw = await Parcel.aggregate([
    {
      $match: {
        receiver: userEmail,
        currentStatus: ParcelStatus.DELIVERED,
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

  const deliveryTrend: MonthlyDataItem[] = deliveryTrendRaw.map((item) => ({
    month: monthNames[item._id.month - 1],
    deliveries: item.count,
  }));

  // Location distribution (top 5 delivery addresses)
  const locationDistributionRaw = await Parcel.aggregate([
    {
      $match: {
        receiver: userEmail,
        currentStatus: ParcelStatus.DELIVERED,
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

  const totalDeliveries = locationDistributionRaw.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const locationDistribution: LocationDataItem[] = locationDistributionRaw.map(
    (item) => ({
      name: item._id || 'Unknown',
      value: Math.round((item.count / totalDeliveries) * 100),
    })
  );

  return {
    incomingParcels,
    deliveredThisMonth,
    pendingConfirmation,
    totalReceived,
    deliveryTrend,
    locationDistribution,
  };
};

const getIncomingParcels = async (
  user: JwtPayload,
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }
) => {
  const userEmail = user?.email;
  const { page = 1, limit = 10, status, search } = params;

  const query: any = { receiver: userEmail };

  if (status && status !== 'all') {
    query.currentStatus = status.toUpperCase();
  }

  if (search) {
    query.$or = [
      { trackingId: { $regex: search, $options: 'i' } },
      { sender: { $regex: search, $options: 'i' } },
    ];
  }

  const parcels = await Parcel.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Parcel.countDocuments(query);

  return {
    parcels,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

// ============= ADMIN DASHBOARD METHODS =============
const getAdminOverviewStats = async (): Promise<OverviewStats> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total parcels
  const totalParcels = await Parcel.countDocuments();

  const totalUsers = await User.countDocuments();

  // Pending deliveries
  const pendingDeliveries = await Parcel.countDocuments({
    currentStatus: { $in: [ParcelStatus.APPROVED, ParcelStatus.IN_TRANSIT] }
  });

  // Revenue this month (sum of fees from delivered parcels)
  const revenueThisMonthData = await Parcel.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth },
        currentStatus: ParcelStatus.DELIVERED
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$fee' }
      }
    }
  ]);


  const currentRevenue = revenueThisMonthData[0]?.total || 0;


  return {
    totalParcels,
    totalUsers,
    pendingDeliveries,
    revenueThisMonth: currentRevenue
  };
};

const getAdminParcelTrends = async (days: number = 90): Promise<ParcelTrendData[]> => {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const trends = await Parcel.aggregate([
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
  const dataMap = new Map<string, ParcelTrendData>();

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

    const data = dataMap.get(date)!;
    if (item._id.status === ParcelStatus.DELIVERED) data.delivered = item.count;
    else if (item._id.status === ParcelStatus.IN_TRANSIT) data.transit = item.count;
    else if (item._id.status === ParcelStatus.REQUESTED) data.pending = item.count;
  });

  return Array.from(dataMap.values());
};

const getAdminDistrictDistribution = async (limit: number = 10): Promise<DistrictData[]> => {
  const distribution = await Parcel.aggregate([
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
            $cond: [{ $eq: ['$_id.status', ParcelStatus.DELIVERED] }, '$count', 0]
          }
        },
        transit: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', ParcelStatus.IN_TRANSIT] }, '$count', 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$_id.status', ParcelStatus.REQUESTED] }, '$count', 0]
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
};

const getAdminRevenueGrowth = async (months: number = 12): Promise<RevenueData[]> => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get revenue data from delivered parcels
  const revenueData = await Parcel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        currentStatus: ParcelStatus.DELIVERED
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
  const result: RevenueData[] = [];

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
    const monthData = revenueData.find(
      d => d._id.year === date.getFullYear() && d._id.month === date.getMonth() + 1
    );

    result.push({
      month: monthNames[date.getMonth()],
      revenue: monthData?.revenue || 0
    });
  }

  // Calculate projection
  const historicalRevenues = result.filter(r => r.revenue && r.revenue > 0);
  if (historicalRevenues.length >= 3) {
    const avgGrowth = historicalRevenues.reduce((acc, curr, idx) => {
      if (idx === 0) return 0;
      return acc + (curr.revenue! - historicalRevenues[idx - 1].revenue!);
    }, 0) / (historicalRevenues.length - 1);

    const lastRevenue = historicalRevenues[historicalRevenues.length - 1].revenue!;
    result.forEach((item, idx) => {
      if (!item.revenue || item.revenue === 0) {
        const monthsAhead = idx - historicalRevenues.length + 1;
        item.projection = Math.round(lastRevenue + (avgGrowth * monthsAhead));
      } else {
        item.projection = item.revenue;
      }
    });
  }

  return result;
};

const getAdminSystemMetrics = async (): Promise<SystemMetrics> => {
  // Average delivery time (based on statusLogs)
  const deliveredParcels = await Parcel.find({
    currentStatus: ParcelStatus.DELIVERED,
  }).select('createdAt statusLogs');

  let totalDeliveryTime = 0;
  let validDeliveries = 0;

  deliveredParcels.forEach(parcel => {
    const deliveredLog = parcel.statusLogs?.find(
      log => log.status === ParcelStatus.DELIVERED
    );
    if (deliveredLog) {
      const deliveryTime = deliveredLog.timestamp.getTime() - parcel.createdAt!.getTime();
      totalDeliveryTime += deliveryTime;
      validDeliveries++;
    }
  });

  const avgDeliveryTimeMs = validDeliveries > 0 ? totalDeliveryTime / validDeliveries : 0;
  const avgDeliveryDays = (avgDeliveryTimeMs / (1000 * 60 * 60 * 24)).toFixed(1);

  // Success rate
  const totalParcels = await Parcel.countDocuments();
  const successfulDeliveries = await Parcel.countDocuments({
    currentStatus: ParcelStatus.DELIVERED
  });
  const successRate = totalParcels > 0
    ? ((successfulDeliveries / totalParcels) * 100).toFixed(1)
    : '0';

  // Peak hours
  const hourlyDistribution = await Parcel.aggregate([
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

  const peakHour = hourlyDistribution[0]?._id || 14;
  const peakHours = `${peakHour % 12 || 12}-${(peakHour + 2) % 12 || 12} ${peakHour >= 12 ? 'PM' : 'AM'}`;

  // Active users now
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const activeNow = await User.countDocuments({
    lastLoginAt: { $gte: oneHourAgo }
  });

  return {
    avgDeliveryTime: `${avgDeliveryDays} days`,
    successRate: `${successRate}%`,
    peakHours,
    activeNow
  };
};

export const dashboardService = {
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