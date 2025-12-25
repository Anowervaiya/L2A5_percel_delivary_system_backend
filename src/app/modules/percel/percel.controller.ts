import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ParcelService } from './percel.service';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';

const createParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const parcel = await ParcelService.createParcel(user, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: 'parcel is created succesfully',
      data: parcel,
    });
  }
);

const cancelParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const Id = req.params.id;
    const user = req.user as JwtPayload;
    const parcel = await ParcelService.cancelParcel(Id, user);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: 'parcel is cancelled succesfully',
      data: parcel,
    });
  }
);

const confirmParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const Id = req.params.id;
    const user = req.user as string;
    const parcel = await ParcelService.confirmParcel(Id, user);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: 'parcel is delivered succesfully',
      data: parcel,
    });
  }
);

const finterParcelByStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;
    const result = await ParcelService.finterParcelByStatus(status as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: 'specifice parcel is retrieved succesfully',
      meta: result?.meta,
      data: result?.data,
    });
  }
);

const deleteParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const Id = req.params.id;
    await ParcelService.deleteParcel(Id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: 'Parcel is deleted Successfully',
      data: null,
    });
  }
);

const changeParcelStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const data = req.body;

    const payload = {
      ...data,
      ...user,
    };

    const parcel = await ParcelService.changeParcelStatus(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: 'parcel status is changed succesfully',
      data: parcel,
    });
  }
);

const myParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const parcel = await ParcelService.myParcel(user);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: 'parcel retrieved succesfully',
      data: parcel,
    });
  }
);

const allParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelService.allParcel();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: 'All parcel are retrieved succesfully',
      data: result.data,
      meta: result.meta,
    });
  }
);

const ParcelByTrackingId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const trackingId = req.params.trackingId;
    const parcel = await ParcelService.ParcelByTrackingId(trackingId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: 'parcel retrieved succussfully',
      data: parcel,
    });
  }
);

// Dashboard Controllers
const getDashboardStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const stats = await ParcelService.getDashboardStats(user);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Dashboard stats retrieved successfully',
      data: stats,
    });
  }
);

const getRecentParcels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const { page = 1, limit = 10, status, search } = req.query;

    const result = await ParcelService.getRecentParcels(user, {
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      search: search as string,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Recent parcels retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  }
);

export const ParcelController = {
  createParcel,
  cancelParcel,
  changeParcelStatus,
  myParcel,
  ParcelByTrackingId,
  allParcel,
  confirmParcel,
  deleteParcel,
  finterParcelByStatus,
  getDashboardStats,
  getRecentParcels,
};