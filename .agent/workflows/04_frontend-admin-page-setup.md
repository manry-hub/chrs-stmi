---
description: fourth
---

# 04 — Frontend: Admin & Superadmin Page Setup

## Goal

Build all UI for the **admin (OB/Satpam)** dashboard and the **superadmin** management panel, including real-time report dashboards, detail views, status update flows, user management tables, and analytics widgets.

---

## Prerequisites

- [ ] Workflow `03_backend-admin-page-setup.md` completed
- [ ] `confirmReport`, `getUsers`, `updateUserRole`, `deleteUser`, `getAnalytics` actions working
- [ ] Real-time Firestore helpers (`subscribeToAllReportsAdmin`, `subscribeToReportLogs`) ready

---

## Pages to Build

### Admin Routes

| Route                       | Page                           | Access                |
| --------------------------- | ------------------------------ | --------------------- |
| `/admin`                    | Admin dashboard (real-time)    | `admin`, `superadmin` |
| `/admin/reports/[reportId]` | Report detail + confirm action | `admin`, `superadmin` |

### Superadmin Routes

| Route                 | Page                        | Access       |
| --------------------- | --------------------------- | ------------ |
| `/superadmin`         | Analytics overview          | `superadmin` |
| `/superadmin/users`   | User management table       | `superadmin` |
| `/superadmin/reports` | Full report monitoring view | `superadmin` |

---

## Step-by-Step

### Step 1 — Route Groups & Protected Layouts

```
src/app/
├── (admin)/
│   ├── layout.tsx           ← Admin layout + sidebar
│   ├── admin/
│   │   ├── page.tsx         ← Real-time dashboard
│   │   └── reports/
│   │       └── [reportId]/page.tsx
└── (superadmin)/
    ├── layout.tsx           ← Superadmin layout + sidebar
    └── superadmin/
        ├── page.tsx         ← Analytics
        ├── users/page.tsx
        └── reports/page.tsx
```

**Admin Layout** (`src/app/(admin)/layout.tsx`):

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }) {
    const session = await auth();
    const allowed = ["admin", "superadmin"];
    if (!session || !allowed.includes(session.user.role)) redirect("/login");

    return (
        <div className="flex min-h-screen">
            <AdminSidebar role={session.user.role} />
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}
```

---

### Step 2 — Admin Dashboard (Real-Time Report List)

Location: `src/app/(admin)/admin/page.tsx`

This is a **Client Component** because it subscribes to real-time Firestore data.

```tsx
"use client";

import { useEffect, useState } from "react";
import { subscribeToAllReportsAdmin } from "@/lib/firebase/reports";
import { ReportTable } from "@/components/admin/ReportTable";
import { ReportFilterBar } from "@/components/admin/ReportFilterBar";
import type { ReportDocument, ReportStatus } from "@/types";

export default function AdminDashboard() {
    const [reports, setReports] = useState<ReportDocument[]>([]);
    const [filter, setFilter] = useState<ReportStatus | "all">("all");

    useEffect(() => {
        const unsub = subscribeToAllReportsAdmin(setReports);
        return unsub;
    }, []);

    const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard Laporan</h1>
            <ReportFilterBar value={filter} onChange={setFilter} />
            <ReportTable reports={filtered} />
        </div>
    );
}
```

**`ReportFilterBar` component** — tabs or segmented control:

```tsx
const FILTERS = [
    { value: "all", label: "Semua" },
    { value: "pending", label: "Belum Dikonfirmasi" },
    { value: "confirmed", label: "Dikonfirmasi" },
];
```

**`ReportTable` component** — columns:

| Column        | Content                                       |
| ------------- | --------------------------------------------- |
| Reporter      | `userName`                                    |
| Lokasi        | `location.name`                               |
| Deskripsi     | Truncated to 60 chars                         |
| Status        | `ReportStatusBadge`                           |
| Waktu Laporan | `createdAt` formatted                         |
| Aksi          | "Lihat Detail" button → `/admin/reports/[id]` |

---

### Step 3 — Report Detail Page (Admin)

Location: `src/app/(admin)/admin/reports/[reportId]/page.tsx`

Split into two parts:

**Server Component** — fetch initial report data:

```tsx
import { adminDb } from "@/lib/firebase/admin";
import { ReportDetailClient } from "@/components/admin/ReportDetailClient";

export default async function ReportDetailPage({ params }) {
    const snap = await adminDb.collection("reports").doc(params.reportId).get();
    if (!snap.exists) notFound();

    const report = { id: snap.id, ...snap.data() };
    return <ReportDetailClient report={report} />;
}
```

**Client Component** (`ReportDetailClient`) — shows real-time logs + confirm button:

```tsx
"use client";
// Props: report (initial data)

// Subscribe to logs in real-time
useEffect(() => {
    const unsub = subscribeToReportLogs(report.id, setLogs);
    return unsub;
}, [report.id]);
```

**UI sections in detail page:**

1. **Report info card** — image (full size), description, location (with map link if lat/lng available), additionalMessage, reporter name, submitted time
2. **Status badge** — current status
3. **Confirm button** — only visible if status is `pending` and user is admin/superadmin
4. **Activity log timeline** — chronological list of log entries from subcollection

**Confirm flow:**

```tsx
async function handleConfirm() {
    setLoading(true);
    try {
        await confirmReport({ reportId: report.id, note: "Dikonfirmasi oleh admin" });
        toast.success("Laporan berhasil dikonfirmasi");
    } catch (err) {
        toast.error("Gagal mengkonfirmasi laporan");
    } finally {
        setLoading(false);
    }
}
```

---

### Step 4 — Superadmin Analytics Dashboard

Location: `src/app/(superadmin)/superadmin/page.tsx` (Server Component)

```tsx
import { getAnalytics } from "@/actions/analytics/getAnalytics";
import { StatsCard } from "@/components/superadmin/StatsCard";

export default async function SuperadminDashboard() {
    const { total, pending, confirmed, avgResponseMinutes } = await getAnalytics();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Analytics Sistem</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="Total Laporan" value={total} />
                <StatsCard label="Belum Dikonfirmasi" value={pending} color="yellow" />
                <StatsCard label="Dikonfirmasi" value={confirmed} color="green" />
                <StatsCard label="Rata-rata Respons" value={avgResponseMinutes ? `${avgResponseMinutes.toFixed(1)} menit` : "N/A"} />
            </div>
        </div>
    );
}
```

---

### Step 5 — User Management Table (Superadmin)

Location: `src/app/(superadmin)/superadmin/users/page.tsx`

**Server Component** — fetch users:

```tsx
import { getUsers } from "@/actions/users/getUsers";
import { UserManagementTable } from "@/components/superadmin/UserManagementTable";

export default async function UsersPage() {
    const users = await getUsers();
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Manajemen User</h1>
            <UserManagementTable users={users} />
        </div>
    );
}
```

**`UserManagementTable`** (Client Component) — columns:

| Column  | Content                                   |
| ------- | ----------------------------------------- |
| Nama    | `name`                                    |
| Email   | `email`                                   |
| Telepon | `phone`                                   |
| Role    | Dropdown: `user` / `admin` / `superadmin` |
| Aksi    | Delete button (with confirmation dialog)  |

**Role update inline:**

```tsx
async function handleRoleChange(userId: string, role: UserRole) {
    await updateUserRole({ userId, role });
    toast.success("Role berhasil diperbarui");
}
```

**Delete with confirmation:**

- Use a modal/dialog: "Apakah Anda yakin ingin menghapus user ini?"
- On confirm → call `deleteUser(userId)` → show toast → refresh list

---

### Step 6 — Admin Sidebar Component

Location: `src/components/admin/AdminSidebar.tsx`

```tsx
const ADMIN_NAV = [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }];

const SUPERADMIN_NAV = [
    { href: "/superadmin", label: "Analytics", icon: BarChart },
    { href: "/superadmin/users", label: "Users", icon: Users },
    { href: "/superadmin/reports", label: "Laporan", icon: FileText },
];
```

- Show `ADMIN_NAV` for `admin` role
- Show `SUPERADMIN_NAV` for `superadmin` role
- Include logout button (calls `signOut()`)
- Show current user name + role badge in sidebar header

---

### Step 7 — Shared Components

| Component                 | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| `ReportTable.tsx`         | Sortable, filterable report list table    |
| `ReportFilterBar.tsx`     | Status filter tabs                        |
| `ReportDetailClient.tsx`  | Real-time detail view + confirm button    |
| `ActivityLogTimeline.tsx` | Visual timeline for report logs           |
| `StatsCard.tsx`           | Analytics metric card                     |
| `UserManagementTable.tsx` | User CRUD table with inline role selector |
| `ConfirmDialog.tsx`       | Reusable confirmation modal               |
| `AdminSidebar.tsx`        | Sidebar nav for admin/superadmin          |

---

## Definition of Done

- [ ] Admin dashboard shows all reports in real-time (no refresh needed)
- [ ] Filter by status works correctly
- [ ] Report detail shows image, info, logs, and confirm button
- [ ] Confirm button is hidden for already-confirmed reports
- [ ] Superadmin analytics page shows correct totals and avg response time
- [ ] User management table allows role change and delete with confirmation
- [ ] Sidebar navigation links correct routes per role
- [ ] No Firestore Admin SDK imported in any Client Component
- [ ] All pages have proper loading states (skeleton or spinner)
- [ ] No layout shift on initial load
