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
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
    DASHBOARD_REPORTS: "/dashboard/reports",
    REPORTS: "/reports",
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
    { value: "tidak-ada-didalam-daftar-isi-di-pesan-tambahan", label: "Tidak ada didalam daftar, Isi di pesan tambahan" },
];

export const CAMPUS_LOCATIONS = [
    { value: "Gedung A Lantai 1 - Budi", label: "Gedung A Lantai 1 - Budi" },
    { value: "Gedung A Lantai 2 - Agus", label: "Gedung A Lantai 2 - Agus" },
    { value: "Gedung A Lantai 3 - Siti", label: "Gedung A Lantai 3 - Siti" },
    { value: "Gedung A Lantai 4 - Slamet", label: "Gedung A Lantai 4 - Slamet" },
    { value: "Gedung A Lantai 5 - Bambang", label: "Gedung A Lantai 5 - Bambang" },
    { value: "Gedung A Lantai 6 - Rian", label: "Gedung A Lantai 6 - Rian" },
    { value: "Gedung A Lantai 7 - Hendra", label: "Gedung A Lantai 7 - Hendra" },
    { value: "Aula - Pa Adi", label: "Aula - Pa Adi" },
    { value: "Teras - Pa Zaki", label: "Teras - Pa Zaki" },
    { value: "Lapangan - Pa Henry", label: "Lapangan - Pa Henry" },
    { value: "Taman - Pa Juniar", label: "Taman - Pa Juniar" },
    { value: "Parkiran - Bu Rana", label: "Parkiran - Bu Rana" },
    { value: "Gedung B Lantai 1 - Pa Jun", label: "Gedung B Lantai 1 - Pa Jun" },
    { value: "Gedung B Lantai 2 - Pa Jaya", label: "Gedung B Lantai 2 - Pa Jaya" },
    { value: "Gedung B Lantai 3 - Pa Soni", label: "Gedung B Lantai 3 - Pa Soni" },
    { value: "Gedung B Lantai 4 - Pa taufiki", label: "Gedung B Lantai 4 - Pa taufik" },
];
