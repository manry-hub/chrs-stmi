import { Timestamp } from "firebase/firestore";
import { USER_ROLES, REPORT_STATUS, REPORTER_SOURCE } from "@/constants";

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];
export type ReporterSource = (typeof REPORTER_SOURCE)[keyof typeof REPORTER_SOURCE];

export interface UserDocument {
    id: string; // from auth UID
    name: string;
    email: string;
    role: UserRole;
    phone: string;
    createdAt: Timestamp;
}

export interface LocationDocument {
    id: string;
    name: string;
    adminIds: string[];
    adminNames: string[];
    createdAt: Timestamp;
}

export interface HazardTypeDocument {
    id: string;
    name: string;
    createdAt: Timestamp;
}

export interface ReportLocation {
    name: string;
    lat: number;
    lng: number;
}

export interface ReportDocument {
    id: string;
    /** null untuk laporan publik; terisi hanya pada laporan lama berbasis akun. */
    userId: string | null;
    /** Nama pelapor. Diisi dari input "Nama Pelapor" pada laporan publik. */
    userName: string;
    reporterSource?: ReporterSource;
    /** Identitas lemah perangkat pengirim, bukan akun. */
    deviceId?: string;
    imageUrl: string;
    description: string;
    locationId?: string;       // New field for dynamic location
    assignedAdminId?: string;  // New field for admin tracking
    confirmedBy?: string;      // New field for tracking who confirmed the report
    location: ReportLocation;
    additionalMessage?: string;
    status: ReportStatus;
    /** Ditandai petugas sebagai laporan tidak sah; disembunyikan dan tidak dihitung. */
    isSpam?: boolean;
    spamMarkedBy?: string;
    spamMarkedAt?: Timestamp;
    proofImageUrl?: string;
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
