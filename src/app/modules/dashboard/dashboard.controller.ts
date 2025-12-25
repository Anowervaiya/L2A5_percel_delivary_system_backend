// controllers/receiverDashboard.controller.ts
import { NextFunction, Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { JwtPayload } from 'jsonwebtoken';


// Dashboard Controllers
const getSenderStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const stats = await dashboardService.getSenderStats(user);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'sender stats retrieved successfully',
      data: stats,
    });
  }
);

const getSenderParcels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const { page = 1, limit = 10, status, search } = req.query;

    const result = await dashboardService.getSenderParcels(user, {
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      search: search as string,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'sender parcels retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }
);


const getReceiverStats = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload; // From auth middleware

    const stats = await dashboardService.getReceiverDashboardStats(user);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Receiver dashboard stats retrieved successfully',
      data: stats,
    });
  }
);

const getReceiverParcels = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const { page, limit, status, search } = req.query;

    const result = await dashboardService.getIncomingParcels(user, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string,
      search: search as string,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Incoming parcels retrieved successfully',
      data: result,
    });
  }
);

//Admin Dashboard
const getAdminOverview = catchAsync(
  async (req: Request, res: Response) => {
    const stats = await dashboardService.getAdminOverviewStats();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Admin overview stats retrieved successfully',
      data: stats,
    });
  }
);

const getParcelTrends = catchAsync(
  async (req: Request, res: Response) => {
    const { days } = req.query;
    const daysNumber = days ? Number(days) : 90;

    const trends = await dashboardService.getAdminParcelTrends(daysNumber);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Parcel trends retrieved successfully',
      data: trends,
    });
  }
);

const getDistrictDistribution = catchAsync(
  async (req: Request, res: Response) => {
    const { limit } = req.query;
    const limitNumber = limit ? Number(limit) : 10;

    const distribution = await dashboardService.getAdminDistrictDistribution(limitNumber);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'District distribution retrieved successfully',
      data: distribution,
    });
  }
);

const getRevenueGrowth = catchAsync(
  async (req: Request, res: Response) => {
    const { months } = req.query;
    const monthsNumber = months ? Number(months) : 12;

    const revenue = await dashboardService.getAdminRevenueGrowth(monthsNumber);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Revenue growth data retrieved successfully',
      data: revenue,
    });
  }
);

const getSystemMetrics = catchAsync(
  async (req: Request, res: Response) => {
    const metrics = await dashboardService.getAdminSystemMetrics();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'System metrics retrieved successfully',
      data: metrics,
    });
  }
);
export const dashboardController = {
  getSenderStats,
  getSenderParcels,

  getReceiverStats,
  getReceiverParcels,

  getAdminOverview,
  getParcelTrends,
  getDistrictDistribution,
  getRevenueGrowth,
  getSystemMetrics,

}