---
description: third
---

# 03 — Backend: Admin & Superadmin Logic Setup

## Goal

Implement all server-side logic for the **admin (OB/Satpam)** and **superadmin** roles: report status updates, report log writing, user management (CRUD), role management (RBAC), and analytics data aggregation.

---

## Prerequisites

- [ ] Workflow `02_backend-user-page-setup.md` completed
- [ ] Admin SDK initialized at `src/lib/firebase/admin.ts`
- [ ] Auth.js `auth()` helper working with role in session

---

## Step-by-Step

### Step 1 — Middleware for Route Protection

File: `src/middleware.ts`

Protect all admin and superadmin routes at the edge level:

```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const role = req.auth?.user?.role;

    // Admin routes
    if (pathname.startsWith("/admin") && role !== "admin" && role !== "superadmin") {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Superadmin routes
    if (pathname.startsWith("/superadmin") && role !== "superadmin") {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*", "/superadmin/:path*"],
};
```

> Middleware runs at the edge — it is a first layer. Always re-verify role inside Server Actions as a second layer.

---

### Step 2 — Confirm Report Action (Admin)

File: `src/actions/reports/confirmReport.ts`

```ts
"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

const confirmSchema = z.object({
    reportId: z.string().min(1),
    note: z.string().optional(),
});

export async function confirmReport(input: unknown) {
    const session = await auth();

    // Second-layer role check
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
        throw new Error("Unauthorized");
    }

    const { reportId, note } = confirmSchema.parse(input);

    const reportRef = adminDb.collection("reports").doc(reportId);

    // Verify report exists and is still pending
    const reportSnap = await reportRef.get();
    if (!reportSnap.exists) throw new Error("Laporan tidak ditemukan");
    if (reportSnap.data()?.status === "confirmed") {
        throw new Error("Laporan sudah dikonfirmasi sebelumnya");
    }

    // Update report status
    await reportRef.update({
        status: "confirmed",
        updatedAt: FieldValue.serverTimestamp(),
    });

    // Write audit log to subcollection
    await reportRef.collection("logs").add({
        action: "confirmed",
        performedBy: session.user.id,
        note: note ?? "Status diperbarui oleh admin",
        createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
}
```

---

### Step 3 — Real-Time Listener Helper (All Reports for Admin)

File: `src/lib/firebase/reports.ts` — add to existing file:

```ts
export function subscribeToAllReportsAdmin(cb: (reports: ReportDocument[]) => void) {
    const q = query(reportsRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ReportDocument)));
}

export function subscribeToReportLogs(reportId: string, cb: (logs: ReportLog[]) => void) {
    const logsRef = collection(db, "reports", reportId, "logs");
    const q = query(logsRef, orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ReportLog)));
}
```

---

### Step 4 — User Management Actions (Superadmin Only)

#### Get All Users

File: `src/actions/users/getUsers.ts`

```ts
"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function getUsers() {
    const session = await auth();
    if (session?.user.role !== "superadmin") throw new Error("Unauthorized");

    const snap = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
```

#### Update User Role

File: `src/actions/users/updateUserRole.ts`

```ts
"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const updateRoleSchema = z.object({
    userId: z.string(),
    role: z.enum(["user", "admin", "superadmin"]),
});

export async function updateUserRole(input: unknown) {
    const session = await auth();
    if (session?.user.role !== "superadmin") throw new Error("Unauthorized");

    const { userId, role } = updateRoleSchema.parse(input);

    // Prevent superadmin from demoting themselves
    if (userId === session.user.id) throw new Error("Tidak dapat mengubah role sendiri");

    await adminDb.collection("users").doc(userId).update({ role });
    return { success: true };
}
```

#### Delete User

File: `src/actions/users/deleteUser.ts`

```ts
"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function deleteUser(userId: string) {
    const session = await auth();
    if (session?.user.role !== "superadmin") throw new Error("Unauthorized");
    if (userId === session.user.id) throw new Error("Tidak dapat menghapus akun sendiri");

    await adminDb.collection("users").doc(userId).delete();
    return { success: true };
}
```

---

### Step 5 — Analytics Data (Superadmin Dashboard)

File: `src/actions/analytics/getAnalytics.ts`

```ts
"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function getAnalytics() {
    const session = await auth();
    if (session?.user.role !== "superadmin") throw new Error("Unauthorized");

    const reportsSnap = await adminDb.collection("reports").get();
    const reports = reportsSnap.docs.map((d) => d.data());

    const total = reports.length;
    const pending = reports.filter((r) => r.status === "pending").length;
    const confirmed = reports.filter((r) => r.status === "confirmed").length;

    // Average response time: createdAt → first "confirmed" log
    const responseTimes: number[] = [];

    for (const doc of reportsSnap.docs) {
        if (doc.data().status !== "confirmed") continue;
        const logsSnap = await adminDb
            .collection("reports")
            .doc(doc.id)
            .collection("logs")
            .where("action", "==", "confirmed")
            .orderBy("createdAt", "asc")
            .limit(1)
            .get();

        if (!logsSnap.empty) {
            const created = doc.data().createdAt?.seconds ?? 0;
            const confirmed = logsSnap.docs[0].data().createdAt?.seconds ?? 0;
            if (created && confirmed) {
                responseTimes.push((confirmed - created) / 60); // minutes
            }
        }
    }

    const avgResponseMinutes = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : null;

    return { total, pending, confirmed, avgResponseMinutes };
}
```

> For high-traffic apps, consider aggregating these counts with Firestore counters or Cloud Functions to avoid full collection scans.

---

### Step 6 — Firestore Security Rules

File: `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() {
      return request.auth != null;
    }

    function getRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return isAuth() && getRole() in ['admin', 'superadmin'];
    }

    function isSuperAdmin() {
      return isAuth() && getRole() == 'superadmin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuth() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuth() && request.auth.uid == userId;
      allow update: if isSuperAdmin();
      allow delete: if isSuperAdmin();
    }

    // Reports collection
    match /reports/{reportId} {
      allow read: if true; // Public read
      allow create: if isAuth() && getRole() == 'user';
      allow update: if isAdmin(); // Only admin/superadmin can update status

      // Logs subcollection
      match /logs/{logId} {
        allow read: if isAuth();
        allow write: if false; // Only via Admin SDK (server-side)
      }
    }
  }
}
```

---

### Step 7 — Firestore Indexes

File: `firestore.indexes.json`

```json
{
    "indexes": [
        {
            "collectionGroup": "reports",
            "queryScope": "COLLECTION",
            "fields": [
                { "fieldPath": "userId", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "DESCENDING" }
            ]
        },
        {
            "collectionGroup": "reports",
            "queryScope": "COLLECTION",
            "fields": [
                { "fieldPath": "status", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "DESCENDING" }
            ]
        },
        {
            "collectionGroup": "logs",
            "queryScope": "COLLECTION_GROUP",
            "fields": [
                { "fieldPath": "action", "order": "ASCENDING" },
                { "fieldPath": "createdAt", "order": "ASCENDING" }
            ]
        }
    ]
}
```

---

## Definition of Done

- [ ] `confirmReport` action updates Firestore status and writes audit log
- [ ] Middleware blocks non-admin access to `/admin` and `/superadmin` routes
- [ ] All superadmin actions (CRUD users, role update) are role-checked server-side
- [ ] `getAnalytics` returns total, pending, confirmed counts, and avg response time
- [ ] `firestore.rules` deployed and tested — public cannot write reports directly
- [ ] `firestore.indexes.json` deployed — no "index required" errors in queries
- [ ] No Admin SDK imports in any Client Component
