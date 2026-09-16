export const REPORT_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    DONE: "done",
} as const;

export const USER_ROLES = {
    USER: "user",
    ADMIN: "admin",
    SUPERADMIN: "superadmin",
} as const;

export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    LAPOR: "/lapor",
    REPORTS: "/reports",
} as const;

/**
 * Asal sebuah laporan. "public" = dikirim civitas akademika tanpa login,
 * "account" = laporan lama dari era ketika civitas masih punya akun.
 */
export const REPORTER_SOURCE = {
    PUBLIC: "public",
    ACCOUNT: "account",
} as const;

export const HAZARD_TYPES = [
    { value: "kabel-teruntai", label: "Kabel teruntai/terbuka" },
    { value: "lantai-licin", label: "Lantai licin/rusak" },
    { value: "kebocoran-air", label: "Kebocoran air/pipa" },
    { value: "kerusakan-plafon", label: "Kerusakan plafon/atap" },
    { value: "apar-expired", label: "APAR expired/tidak ada" },
    { value: "lampu-mati", label: "Lampu mati/penerangan kurang" },
    { value: "sampah-menumpuk", label: "Sampah menumpuk" },
    { value: "fasilitas-rusak", label: "Fasilitas umum rusak (kursi, meja, dsb)" },
    { value: "penempatan-alat-berat-yang-tidak-sesuai-tempatnya", label: "penempatan-alat-berat-yang-tidak-sesuai-tempatnya" },
];

export const CAMPUS_LOCATIONS = [
    { value: "Aula", label: "Aula" },
    { value: "Teras", label: "Teras" },
    { value: "Lapangan ", label: "Lapangan" },
    { value: "Taman", label: "Taman" },
    { value: "Parkiran", label: "Parkiran" },
    { value: "Gedung A Lantai", label: "Gedung A Lantai 1" },
    { value: "Gedung A Lantai 2", label: "Gedung A Lantai 2" },
    { value: "Gedung A Lantai 3", label: "Gedung A Lantai 3" },
    { value: "Gedung A Lantai 4", label: "Gedung A Lantai 4" },
    { value: "Gedung A Lantai 5", label: "Gedung A Lantai 5" },
    { value: "Gedung A Lantai 6", label: "Gedung A Lantai 6" },
    { value: "Gedung A Lantai 7", label: "Gedung A Lantai 7" },
    { value: "Gedung B Lantai 1", label: "Gedung B Lantai 1" },
    { value: "Gedung B Lantai 2", label: "Gedung B Lantai 2" },
    { value: "Gedung B Lantai 3", label: "Gedung B Lantai 3" },
    { value: "Gedung B Lantai 4", label: "Gedung B Lantai 4" },
];
