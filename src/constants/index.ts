export const REPORT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
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
    { value: "jalur-evakuasi-terhalang", label: "Jalur evakuasi terhalang" },
    { value: "lampu-mati", label: "Lampu mati/penerangan kurang" },
    { value: "pohon-tumbang", label: "Pohon tumbang/dahan rapuh" },
    { value: "sampah-menumpuk", label: "Sampah menumpuk" },
    { value: "fasilitas-rusak", label: "Fasilitas umum rusak (kursi, meja, dsb)" },
];

export const CAMPUS_LOCATIONS = [
    { value: "Gedung A (Rektorat) - Pak Budi", label: "Gedung A (Rektorat) - Pak Budi" },
    { value: "Gedung B (Fakultas Teknik) - Pak Agus", label: "Gedung B (Fakultas Teknik) - Pak Agus" },
    { value: "Gedung C (Fakultas Ekonomi) - Bu Siti", label: "Gedung C (Fakultas Ekonomi) - Bu Siti" },
    { value: "Perpustakaan Pusat - Ibu Maria", label: "Perpustakaan Pusat - Ibu Maria" },
    { value: "Kantin Utama - Pak Jono", label: "Kantin Utama - Pak Jono" },
    { value: "Masjid Kampus - Pak Amin", label: "Masjid Kampus - Pak Amin" },
    { value: "Area Parkir Utara - Pak Slamet", label: "Area Parkir Utara - Pak Slamet" },
    { value: "Area Parkir Selatan - Pak Bambang", label: "Area Parkir Selatan - Pak Bambang" },
    { value: "Lapangan Olahraga - Pak Rian", label: "Lapangan Olahraga - Pak Rian" },
    { value: "Laboratorium Komputer - Pak Hendra", label: "Laboratorium Komputer - Pak Hendra" },
];
