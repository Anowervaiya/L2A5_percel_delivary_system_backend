// controllers/receiverDashboard.controller.ts
import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { JwtPayload } from 'jsonwebtoken';

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
export const dashboardController = {
    getReceiverStats,
    getReceiverParcels
}