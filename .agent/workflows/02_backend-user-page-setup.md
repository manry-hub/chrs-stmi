---
description: second
---

# 02 — Backend: User-Facing Logic Setup

## Goal

Implement all server-side logic that powers the user-facing pages: authentication, report submission, image upload, and Firestore data access.

---

## Prerequisites

- [ ] Firebase project created (Firestore + Admin SDK)
- [ ] Vercel Blob storage enabled
- [ ] Auth.js (`next-auth` v5) installed
- [ ] Environment variables configured (see below)

---

## Required Environment Variables

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Auth.js
AUTH_SECRET=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# App
NEXT_PUBLIC_EMERGENCY_NUMBER=
```

---

## Step-by-Step

### Step 1 — Firebase Initialization

#### Client SDK (`src/lib/firebase/client.ts`)

```ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    // ... rest of config
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

#### Admin SDK (`src/lib/firebase/admin.ts`)

```ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

export const adminDb = getFirestore();
```

> Use the **Admin SDK** only in Server Actions and API routes — never in Client Components.

---

### Step 2 — Auth.js Configuration

File: `src/lib/auth/index.ts`

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { adminDb } from "@/lib/firebase/admin";
import { loginSchema } from "@/lib/validations/auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            async authorize(credentials) {
                const { email, password } = loginSchema.parse(credentials);
                // Verify password against Firebase Auth via Admin SDK REST
                // Return user object with role from Firestore users collection
                const userSnap = await adminDb.collection("users").where("email", "==", email).limit(1).get();

                if (userSnap.empty) return null;

                const userData = userSnap.docs[0].data();
                // Verify password hash (bcrypt or Firebase Auth REST API)
                return {
                    id: userSnap.docs[0].id,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) token.role = user.role;
            return token;
        },
        session({ session, token }) {
            session.user.role = token.role;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});
```

Extend types in `src/types/next-auth.d.ts`:

```ts
declare module "next-auth" {
    interface User {
        role: "user" | "admin" | "superadmin";
    }
    interface Session {
        user: { role: "user" | "admin" | "superadmin" } & DefaultSession["user"];
    }
}
declare module "next-auth/jwt" {
    interface JWT {
        role: "user" | "admin" | "superadmin";
    }
}
```

---

### Step 3 — Zod Validation Schemas

File: `src/lib/validations/report.ts`

```ts
import { z } from "zod";

export const submitReportSchema = z.object({
    description: z.string().min(10, "Deskripsi minimal 10 karakter"),
    location: z.object({
        name: z.string().min(1, "Nama lokasi wajib diisi"),
        lat: z.number().optional(),
        lng: z.number().optional(),
    }),
    additionalMessage: z.string().optional(),
    imageUrl: z.string().url("URL gambar tidak valid"),
});
```

File: `src/lib/validations/auth.ts`

```ts
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const registerSchema = z
    .object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(8),
        password: z.string().min(6),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Password tidak cocok",
        path: ["confirmPassword"],
    });
```

---

### Step 4 — Server Actions

#### `registerUser` (`src/actions/auth/registerUser.ts`)

```ts
"use server";

import { adminDb } from "@/lib/firebase/admin";
import { registerSchema } from "@/lib/validations/auth";
import { serverTimestamp } from "firebase-admin/firestore";

export async function registerUser(formData: unknown) {
    const data = registerSchema.parse(formData);

    // Check if email already exists
    const existing = await adminDb.collection("users").where("email", "==", data.email).limit(1).get();

    if (!existing.empty) throw new Error("Email sudah terdaftar");

    // Create user document
    const ref = adminDb.collection("users").doc();
    await ref.set({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: "user",
        createdAt: serverTimestamp(),
    });

    return { success: true };
}
```

#### `submitReport` (`src/actions/reports/submitReport.ts`)

```ts
"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { submitReportSchema } from "@/lib/validations/report";
import { FieldValue } from "firebase-admin/firestore";

export async function submitReport(formData: unknown) {
    const session = await auth();
    if (!session || session.user.role !== "user") throw new Error("Unauthorized");

    const data = submitReportSchema.parse(formData);

    const reportRef = adminDb.collection("reports").doc();

    await reportRef.set({
        userId: session.user.id,
        userName: session.user.name,
        ...data,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    // Write initial log to subcollection
    await reportRef.collection("logs").add({
        action: "created",
        performedBy: session.user.id,
        note: "Laporan dibuat oleh user",
        createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, reportId: reportRef.id };
}
```

---

### Step 5 — Image Upload API Route

File: `src/app/api/upload/route.ts`

```ts
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || !file.type.startsWith("image/")) {
        return NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    const blob = await put(`reports/${Date.now()}-${file.name}`, file, {
        access: "public",
    });

    return NextResponse.json({ url: blob.url });
}
```

---

### Step 6 — Firestore Helpers

File: `src/lib/firebase/reports.ts` (Client SDK — for real-time hooks)

```ts
import { db } from "./client";
import { collection, doc, onSnapshot, query, where, orderBy, getDoc, getDocs } from "firebase/firestore";
import type { ReportDocument } from "@/types";

export const reportsRef = collection(db, "reports");

export function subscribeToUserReports(userId: string, cb: (reports: ReportDocument[]) => void) {
    const q = query(reportsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ReportDocument)));
}

export function subscribeToAllReports(cb: (reports: ReportDocument[]) => void) {
    const q = query(reportsRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ReportDocument)));
}
```

---

### Step 7 — TypeScript Types

File: `src/types/index.ts`

```ts
export type UserRole = "user" | "admin" | "superadmin";
export type ReportStatus = "pending" | "confirmed";

export interface UserDocument {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone: string;
    createdAt: FirebaseTimestamp;
}

export interface ReportDocument {
    id: string;
    userId: string;
    userName: string;
    imageUrl: string;
    description: string;
    location: { name: string; lat?: number; lng?: number };
    additionalMessage?: string;
    status: ReportStatus;
    createdAt: FirebaseTimestamp;
    updatedAt: FirebaseTimestamp;
}

export interface ReportLog {
    id: string;
    action: "created" | "confirmed";
    performedBy: string;
    note: string;
    createdAt: FirebaseTimestamp;
}

type FirebaseTimestamp = { seconds: number; nanoseconds: number };
```

---

## Definition of Done

- [ ] Firebase client and admin SDKs initialize without errors
- [ ] Auth.js session includes `role` field on all JWT tokens
- [ ] `registerUser` action creates Firestore user doc with `role: "user"`
- [ ] `submitReport` action writes report + initial log to Firestore
- [ ] Image upload API validates file type/size and returns Vercel Blob URL
- [ ] All Server Actions are protected by session checks
- [ ] TypeScript types cover all Firestore document shapes
- [ ] No `any` types — strict mode enabled in `tsconfig.json`
