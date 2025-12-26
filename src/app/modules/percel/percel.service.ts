import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errorHelpers/appError';
import { IParcel, ParcelStatus } from './percel.interface';
import { Parcel } from './percel.model';
import httpStatus from 'http-status-codes';
interface IAllParcelQuery {
  page?: number;
  limit?: number;
  search?: string;
}

const createParcel = async (user: JwtPayload, payload: Partial<IParcel>) => {


  const trackingId = `trackId_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const info = {
    ...payload,
    sender: user?.email,
    trackingId,
    statusLogs: [
      {
        status: 'REQUESTED',
        updatedBy: user.userId,
        updatedAt: new Date(),
      },
    ],
  };

  const parcel = await Parcel.create(info);
  return parcel;
};

const cancelParcel = async (id: string, user: any) => {
  const parcel = await Parcel.findById(id);
  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, 'parcel does not exist');
  }

  const finalStatus = parcel.statusLogs?.find(
    (statusLog) =>
      statusLog.status === ParcelStatus.DISPATCHED ||
      statusLog.status === ParcelStatus.IN_TRANSIT ||
      statusLog.status === ParcelStatus.DELIVERED ||
      statusLog.status === ParcelStatus.CANCELLED
  );

  if (finalStatus) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      `The parcel is already ${finalStatus.status}. You can't cancel it now.`
    );
  }

  const changableParcel = await Parcel.findByIdAndUpdate(
    id,
    {
      $set: {
        currentStatus: ParcelStatus.CANCELLED,
      },
      $push: {
        statusLogs: {
          status: ParcelStatus.CANCELLED,
          updatedBy: user.userId,
          updatedAt: new Date(),
        },
      },
    },
    { new: true, runValidators: true }
  );

  return changableParcel;
};

const confirmParcel = async (id: string, user: any) => {
  const parcel = await Parcel.findById(id);
  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, 'parcel does not exist');
  }

  if (
    parcel.statusLogs?.some((status) => status.status === ParcelStatus.CANCELLED)
  ) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "parcel is already cancelled .. you can't change the status"
    );
  }

  if (
    parcel.statusLogs?.some((status) => status.status === ParcelStatus.DELIVERED)
  ) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "parcel is already delivered .. you can't change the status"
    );
  }

  const changableParcel = await Parcel.findByIdAndUpdate(
    id,
    {
      $set: {
        currentStatus: ParcelStatus.DELIVERED,
      },
      $push: {
        statusLogs: {
          status: ParcelStatus.DELIVERED,
          updatedBy: user.userId,
          updatedAt: new Date(),
        },
      },
    },
    { new: true, runValidators: true }
  );

  return changableParcel;
};

const finterParcelByStatus = async (status: string) => {
  const filteredParcel = await Parcel.find({ currentStatus: status });

  if (filteredParcel.length === 0) {
    throw new AppError(403, `No parcel found in the status of ${status}`);
  }

  return {
    data: filteredParcel,
    meta: {
      total: filteredParcel?.length,
    },
  };
};

const changeParcelStatus = async (payload: any) => {
  const parcel = await Parcel.findById(payload.id);
  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, 'parcel does not exist');
  }

  if (
    parcel.statusLogs?.some((status) => status.status === ParcelStatus.CANCELLED)
  ) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "parcel is cancelled .. you can't change the status"
    );
  }

  if (
    parcel.statusLogs?.some((singleStatus) => singleStatus.status === payload.status)
  ) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      `You have already ${payload.status} this parcel`
    );
  }

  const changableParcel = await Parcel.findByIdAndUpdate(
    payload.id,
    {
      $set: {
        currentStatus: payload.status,
      },
      $push: {
        statusLogs: {
          status: payload.status,
          updatedBy: payload.userId,
          updatedAt: new Date(),
        },
      },
    },
    { new: true, runValidators: true }
  );

  return changableParcel;
};

const myParcel = async (user: JwtPayload) => {
  const sendedParcel = await Parcel.find({ sender: user?.email });
  const receivedParcel = await Parcel.find({ receiver: user?.email });

  if (sendedParcel.length === 0 && receivedParcel.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No parcels found');
  }

  const parcel = { sendedParcel, receivedParcel };
  return parcel;
};



const allParcel = async (query: any) => {
  const { page, limit, status, search } = query;

  const filter: any = {};

  // 🔹 Status filter
  if (status) {
    filter.currentStatus = status;
  }

  // 🔹 Search (trackingId, sender, receiver)
  if (search) {
    filter.$or = [
      { trackingId: { $regex: search, $options: 'i' } },
      { sender: { $regex: search, $options: 'i' } },
      { receiver: { $regex: search, $options: 'i' } },
    ];
  }

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


// Track parcel by tracking ID
const trackParcelByTrackingId = async (trackingId: string) => {
  const parcel = await Parcel.findOne({ trackingId });

  if (!parcel) {
    return null;
  }

  return parcel;
};

// Get all status logs for a parcel
const getParcelStatusHistory = async (trackingId: string) => {
  const parcel = await Parcel.findOne({ trackingId }).select('statusLogs trackingId');

  if (!parcel) {
    return null;
  }

  return parcel.statusLogs;
};

const deleteParcel = async (id: string) => {
  const parcel = await Parcel.findById(id);

  if (!parcel) {
    throw new AppError(httpStatus.BAD_REQUEST, 'parcel does not exist');
  }

  const result = await Parcel.findOneAndDelete({ _id: id });
  return result;
};



export const ParcelService = {
  createParcel,
  cancelParcel,
  changeParcelStatus,
  myParcel,
  trackParcelByTrackingId,
  getParcelStatusHistory,
  allParcel,
  confirmParcel,
  deleteParcel,
  finterParcelByStatus

};