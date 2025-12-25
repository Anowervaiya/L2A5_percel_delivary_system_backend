import { model, Schema } from "mongoose";
import { IParcel, ParcelStatus } from "./percel.interface";
import { BangladeshDivision } from "./percel.constant";

const statusLogSchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, required: true },
    location: { type: String },
    note: { type: String },
  },
  { _id: false }
);

const parcelSchema = new Schema<IParcel>({
  trackingId: { type: String, unique: true, required: true },
  type: { type: String, required: true },
  weight: { type: Number, required: true },
  fee: { type: Number, default: 130 },
  sender: { type: String, ref: 'User', required: true },
  receiver: { type: String, ref: 'User', required: true },
deliveryLocation: {
      type: String,
      enum: Object.values(BangladeshDivision),
      required: true,
    },
  deliveryAddress: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  currentStatus: { type: String, default: ParcelStatus.REQUESTED },
  statusLogs: [statusLogSchema],
  isBlocked: { type: Boolean, default: false },
  isCancelled: { type: Boolean, default: false },
},  {
    timestamps: true,  // ✅ এটা add করুন
    versionKey: false,
  });
export const Parcel = model('Parcel', parcelSchema);