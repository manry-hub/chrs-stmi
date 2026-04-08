import { Timestamp } from "firebase/firestore";
import { USER_ROLES, REPORT_STATUS } from "@/constants";

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

export interface UserDocument {
  id: string; // from auth UID
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  createdAt: Timestamp;
}

export interface ReportLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface ReportDocument {
  id: string;
  userId: string;
  userName: string;
  imageUrl: string;
  description: string;
  location: ReportLocation;
  additionalMessage?: string;
  status: ReportStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReportLogDocument {
  id: string;
  action: string;
  performedBy: string;
  note: string;
  createdAt: Timestamp;
}
