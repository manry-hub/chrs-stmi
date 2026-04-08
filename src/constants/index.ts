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
