import mongoose, { Schema, Document, Model } from "mongoose";

export enum UserRole {
  PATIENT = "PATIENT",
  DOCTOR = "DOCTOR",
  ADMIN = "ADMIN"
}

export enum ConsultationType {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  HOME_VISIT = "HOME_VISIT"
}

export interface IConsultationOffering {
  type: ConsultationType;
  fee: number;
  isEnabled: boolean;
}

export interface IWorkingTimeSlot {
  time: string;
  isSelected: boolean;
  isAvailable: boolean;
}

export interface IPatientProfile {
  dob?: string;
  gender?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  insuranceInfo?: string;
}

export interface IDoctorProfile {
  specialty?: string;
  hospital?: string;
  bio?: string;
  yearsOfExperience?: number;
  rating?: number;
  reviewCount?: number;
  consultationOfferings?: IConsultationOffering[];
  workingSchedule?: Record<string, IWorkingTimeSlot[]>;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  patientProfile?: IPatientProfile;
  doctorProfile?: IDoctorProfile;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationOfferingSchema = new Schema<IConsultationOffering>({
  type: { type: String, enum: Object.values(ConsultationType), required: true },
  fee: { type: Number, required: true },
  isEnabled: { type: Boolean, required: true }
});

const WorkingTimeSlotSchema = new Schema<IWorkingTimeSlot>({
  time: { type: String, required: true },
  isSelected: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true }
});

const PatientProfileSchema = new Schema<IPatientProfile>({
  dob: String,
  gender: String,
  address: String,
  bloodType: String,
  allergies: String,
  insuranceInfo: String
});

const DoctorProfileSchema = new Schema<IDoctorProfile>({
  specialty: String,
  hospital: String,
  bio: String,
  yearsOfExperience: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  consultationOfferings: [ConsultationOfferingSchema],
  workingSchedule: { type: Schema.Types.Mixed, default: {} }
});

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: String,
  fullName: { type: String, required: true },
  avatarUrl: String,
  role: { type: String, enum: Object.values(UserRole), default: UserRole.PATIENT },
  patientProfile: PatientProfileSchema,
  doctorProfile: DoctorProfileSchema,
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
