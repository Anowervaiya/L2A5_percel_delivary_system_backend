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

const allParcel = catchAsync(async (req, res) => {
  const { page = 1, limit = 8, status, search } = req.query;

  const result = await ParcelService.allParcel({
    page: Number(page),
    limit: Number(limit),
    status: status as string | undefined,
    search: search as string | undefined,
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'All parcels retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});


const trackParcel = catchAsync(async (req: Request, res: Response) => {
  const { trackingId } = req.params;

  const parcel = await ParcelService.trackParcelByTrackingId(trackingId);

  if (!parcel) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Parcel not found with this tracking ID',
      data: null,
    });
  }

  // Check if parcel is blocked
  if (parcel.isBlocked) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: 'This parcel has been blocked',
      data: null,
    });
  }

  // Check if parcel is cancelled
  if (parcel.isCancelled) {
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'This parcel has been cancelled',
      data: parcel,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel tracking information retrieved successfully',
    data: parcel,
  });
});

// Get all status logs for a parcel
const getStatusHistory = catchAsync(async (req: Request, res: Response) => {
  const { trackingId } = req.params;

  const statusLogs = await ParcelService.getParcelStatusHistory(trackingId);

  if (!statusLogs) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Parcel not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Status history retrieved successfully',
    data: statusLogs,
  });
});

export const ParcelController = {
  createParcel,
  cancelParcel,
  changeParcelStatus,
  myParcel,
  trackParcel,
  getStatusHistory,
  allParcel,
  confirmParcel,
  deleteParcel,
  finterParcelByStatus
};