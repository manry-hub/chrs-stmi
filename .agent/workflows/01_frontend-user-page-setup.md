---
description: first
---

# 01 — Frontend: User Page Setup

## Goal

Build all user-facing pages and UI components for the **mahasiswa/dosen** role. This covers authentication UI, report submission, report status viewing, and public report history.

---

## Prerequisites

- [ ] Next.js project initialized with App Router
- [ ] Tailwind CSS configured
- [ ] `src/` directory structure in place (see `rules.md`)
- [ ] Environment variables set: `NEXT_PUBLIC_FIREBASE_*`, `AUTH_SECRET`

---

## Pages to Build

| Route                 | Page                         | Access |
| --------------------- | ---------------------------- | ------ |
| `/login`              | Login page                   | Public |
| `/register`           | Register page                | Public |
| `/`                   | Landing / home               | Public |
| `/dashboard`          | User dashboard + submit form | `user` |
| `/dashboard/reports`  | User's own report history    | `user` |
| `/reports`            | Public report list (all)     | Public |
| `/reports/[reportId]` | Report detail view           | Public |

---

## Step-by-Step

### Step 1 — Route Group & Layout

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (user)/
│   ├── layout.tsx          ← Protected layout (session guard)
│   ├── dashboard/page.tsx
│   └── dashboard/reports/page.tsx
└── reports/
    ├── page.tsx            ← Public list
    └── [reportId]/page.tsx ← Public detail
```

- `(user)/layout.tsx` must check session server-side. Redirect to `/login` if no session or role is not `user`.

```tsx
// src/app/(user)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UserLayout({ children }) {
    const session = await auth();
    if (!session || session.user.role !== "user") redirect("/login");
    return <>{children}</>;
}
```

---

### Step 2 — Auth Pages

#### Login (`/login`)

- Form fields: `email`, `password`
- Use React Hook Form + Zod validation
- On submit: call `signIn("credentials", { email, password })` from Auth.js
- Show loading state during submission
- Show error toast on failure

#### Register (`/register`)

- Form fields: `name`, `email`, `phone`, `password`, `confirmPassword`
- On submit: call a Server Action `registerUser()` that:
    1. Creates user in Firebase Auth (admin SDK)
    2. Writes user doc to `users/{uid}` with `role: "user"`
- Redirect to `/dashboard` on success

---

### Step 3 — Report Submission Form (Dashboard)

Location: `src/components/report/ReportSubmitForm.tsx`

Fields required per ERD:

| Field               | Input type         | Validation                        |
| ------------------- | ------------------ | --------------------------------- |
| `image`             | File upload        | Required, image only, max 5MB     |
| `description`       | Textarea           | Required, min 10 chars            |
| `location.name`     | Text input         | Required                          |
| `location.lat/lng`  | Auto (Geolocation) | Optional fallback to manual input |
| `additionalMessage` | Textarea           | Optional                          |

**Image upload flow:**

1. User picks file → preview shown immediately
2. On form submit → upload to Vercel Blob via `/api/upload` route
3. Save returned `imageUrl` in the Firestore report document

```tsx
// Pseudocode for image upload
const res = await fetch("/api/upload", {
    method: "POST",
    body: formData, // contains the file
});
const { url } = await res.json();
// use url as imageUrl in report
```

**Geolocation:**

```tsx
navigator.geolocation.getCurrentPosition((pos) => {
    setValue("location.lat", pos.coords.latitude);
    setValue("location.lng", pos.coords.longitude);
});
```

---

### Step 4 — Report Status Display

Location: `src/components/report/ReportStatusBadge.tsx`

| Status      | Badge color | Label              |
| ----------- | ----------- | ------------------ |
| `pending`   | Yellow      | Belum Dikonfirmasi |
| `confirmed` | Green       | Dikonfirmasi       |

Use a simple map:

```tsx
const STATUS_CONFIG = {
    pending: { label: "Belum Dikonfirmasi", className: "bg-yellow-100 text-yellow-800" },
    confirmed: { label: "Dikonfirmasi", className: "bg-green-100 text-green-800" },
};
```

---

### Step 5 — Real-Time Report List (User's Own Reports)

Location: `src/hooks/useUserReports.ts`

```ts
import { onSnapshot, query, collection, where } from "firebase/firestore";

export function useUserReports(userId: string) {
    const [reports, setReports] = useState<ReportDocument[]>([]);

    useEffect(() => {
        const q = query(collection(db, "reports"), where("userId", "==", userId));
        const unsub = onSnapshot(q, (snap) => {
            setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
        return unsub; // cleanup on unmount
    }, [userId]);

    return reports;
}
```

---

### Step 6 — Public Report List

Location: `src/app/reports/page.tsx` (Server Component)

- Fetch all reports once (no real-time needed for public page — use `getDocs`)
- Sort by `createdAt` descending
- Display as card grid with `ReportStatusBadge`
- Each card links to `/reports/[reportId]`

---

### Step 7 — Emergency Call Button

Location: `src/components/ui/EmergencyCallButton.tsx`

```tsx
const SATPAM_NUMBER = process.env.NEXT_PUBLIC_EMERGENCY_NUMBER;

export function EmergencyCallButton() {
    return (
        <a href={`tel:${SATPAM_NUMBER}`} className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full px-4 py-3 shadow-lg">
            🚨 Hubungi Satpam
        </a>
    );
}
```

Add to `(user)/layout.tsx` so it appears on every user page.

---

## Components Checklist

- [ ] `ReportSubmitForm.tsx` — full form with image + geo
- [ ] `ReportCard.tsx` — card for list views
- [ ] `ReportStatusBadge.tsx` — status pill
- [ ] `EmergencyCallButton.tsx` — floating call button
- [ ] `ImagePreview.tsx` — image preview before upload
- [ ] `LocationPicker.tsx` — geo or manual location input

---

## Definition of Done

- [ ] All user routes render correctly and are role-protected
- [ ] Report submission writes to Firestore and uploads image to Vercel Blob
- [ ] User can see their own reports update in real-time
- [ ] Emergency call button visible on all user pages
- [ ] All forms validated with Zod, errors shown inline
- [ ] No TypeScript errors (`tsc --noEmit` passes)
