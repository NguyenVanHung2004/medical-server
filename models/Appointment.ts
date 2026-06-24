import mongoose, { Schema, Document, Model } from "mongoose";
import { ConsultationType } from "./User";

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  UPCOMING = "UPCOMING",
  HAPPENING = "HAPPENING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  type: ConsultationType;
  status: AppointmentStatus;
  date: string;
  timeRange: string;
  reason: string;
  location?: string;
  paymentStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: Object.values(ConsultationType), required: true },
  status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.PENDING },
  date: { type: String, required: true },
  timeRange: { type: String, required: true },
  reason: { type: String, required: true },
  location: String,
  paymentStatus: String
}, { timestamps: true });

export const Appointment: Model<IAppointment> = mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);
