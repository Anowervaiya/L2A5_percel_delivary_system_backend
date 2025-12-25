// services/receiverDashboard.service.ts

import { JwtPayload } from "jsonwebtoken";
import { Parcel } from "../percel/percel.model";
import { ParcelStatus } from "../percel/percel.interface";

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

 const getReceiverDashboardStats = async (
  user: JwtPayload
): Promise<ReceiverDashboardStats> => {
  const userEmail = user?.email;

  // Incoming parcels (In Transit + Dispatched)
  const incomingParcels = await Parcel.countDocuments({
    receiver: userEmail,
    currentStatus: { 
      $in: [ParcelStatus.IN_TRANSIT, ParcelStatus.DISPATCHED , ParcelStatus.APPROVED] 
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

  // Pending confirmation (Delivered but not confirmed by receiver)
  const pendingConfirmation = await Parcel.countDocuments({
    receiver: userEmail,
    currentStatus: ParcelStatus.REQUESTED,
    // Add a field in your schema to track confirmation if needed
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

  // Calculate total for percentage
  const totalDeliveries = locationDistributionRaw.reduce(
    (sum, item) => sum + item.count,
    0
  );

  // Format location distribution with percentages
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

// Get recent incoming parcels
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

  // Status filter
  if (status && status !== 'all') {
    query.currentStatus = status.toUpperCase();
  }


  // Search filter
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

export const dashboardService ={
    getReceiverDashboardStats,
getIncomingParcels
}