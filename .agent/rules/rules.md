---
trigger: always_on
---

# Project Rules

## Project Identity

| Attribute     | Value                                                             |
| ------------- | ----------------------------------------------------------------- |
| App name      | HazardReport                                                      |
| Purpose       | Real-time hazard reporting system for campus environments         |
| Language (UI) | Bahasa Indonesia                                                  |
| Target users  | Mahasiswa, Dosen, OB/Satpam, Superadmin (civitas akademika)      |
| Status        | Production-ready — deployed via Vercel                           |

---

## Non-Negotiable Principles

### 1. Real-Time First

Every user-facing state that comes from Firestore **must** use `onSnapshot` (real-time listener), not one-time `getDocs`, **unless** the data is static/reference-only. Admins must see new reports without refreshing.

### 2. Role-Based Access Control (RBAC) is Sacred

Every route, server action, and API handler must verify the caller's role **server-side** before executing any logic. Never trust the client to enforce roles. Roles are:

- `user` → can submit & view reports
- `admin` → can view & update report status
- `superadmin` → full system access, user & role management

### 3. No Direct Firestore Writes from the Client for Sensitive Operations

Status updates, role changes, and user management **must** go through server actions or API routes — never raw client-side Firestore writes — to ensure server-side validation is always applied.

---

## Core Philosophy

> **"Kejelasan dan ketertiban > Kecepatan dan kompleksitas yang tidak perlu"**

Prioritize maintainability and clarity over clever or hyper-optimized code. A slightly less performant but significantly more readable solution wins.

- **SOLID Principles**: Single Responsibility per component/service, Open-Closed for feature extension, proper Dependency Inversion via dependency injection patterns.
- **DRY**: Extract reusable logic into hooks (`/hooks`), utilities (`/lib`), or services — never copy-paste business logic.
- **KISS**: If a feature can be built without a new abstraction layer, build it without one.
- **Clean Code**: Meaningful variable names, small focused functions, zero magic numbers/strings — use constants files.
- **Error Handling**: Every async operation must have a try/catch or `.catch()`. Surface errors to the UI with a toast or error boundary — never swallow them silently.

---

## Code Logic & Structure

- **Explicit over Implicit**: No clever one-liners. Prefer verbose-but-clear over terse-but-cryptic.
- **Server vs Client Components**:
  - Default to **Server Components** in Next.js App Router.
  - Only add `"use client"` when the component needs browser APIs, event handlers, or state.
  - Never fetch Firestore data directly inside a Client Component on mount — use Server Components or real-time hooks.
- **Component Structure**:
  - One component per file, named to match the file.
  - Components must do one thing. If it exceeds ~150 lines, split it.
- **Comments**:
  - Explain *why*, not just *what*.
  - Comment complex logic blocks — especially Firestore queries and auth middleware.

---

## Tech Stack & Constraints

| Concern          | Allowed                                     | Not Allowed                              |
| ---------------- | ------------------------------------------- | ---------------------------------------- |
| Framework        | Next.js (App Router)                        | Pages Router, Create React App           |
| CSS Framework    | Tailwind CSS                                | Bootstrap, custom CSS-in-JS              |
| Database         | Firestore (real-time listeners)             | REST-only polling, localStorage as DB    |
| Auth             | Auth.js (NextAuth v5) + custom credentials | Firebase Auth SDK directly               |
| Storage          | Vercel Blob                                 | Firebase Storage, base64 in Firestore    |
| State management | React state + Context (minimal)             | Redux, Zustand, Jotai (unless justified) |
| Deployment       | Vercel                                      | Firebase Hosting, self-hosted            |
| Forms            | React Hook Form + Zod validation            | Uncontrolled forms, no validation        |
| Real-time        | Firestore `onSnapshot`                      | Polling, WebSockets (unless needed)      |

---

## Firestore Design Rules

- Follow the **nested subcollection** pattern: `reports/{reportId}/logs/{logId}` — do **not** use a global `report_logs` collection.
- Apply **light denormalization**: store `userName` alongside `userId` in reports to avoid extra fetches.
- **No JOINs** — Firestore is NoSQL. Design documents so a single read gives you what you need.
- All Firestore timestamps must use `serverTimestamp()` — never `new Date()` on the client.
- Index frequently queried fields (`userId`, `status`, `createdAt`) via `firestore.indexes.json`.

---

## Firestore Data Model Reference

### `users/{userId}`
```json
{
  "name": "string",
  "email": "string",
  "role": "user | admin | superadmin",
  "phone": "string",
  "createdAt": "timestamp"
}
```

### `reports/{reportId}`
```json
{
  "userId": "string",
  "userName": "string",
  "imageUrl": "string",
  "description": "string",
  "location": { "name": "string", "lat": "number", "lng": "number" },
  "additionalMessage": "string",
  "status": "pending | confirmed",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `reports/{reportId}/logs/{logId}`
```json
{
  "action": "created | confirmed",
  "performedBy": "userId",
  "note": "string",
  "createdAt": "timestamp"
}
```

---

## Directory Structure

```
src/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Auth pages (login, register)
│   ├── (user)/                  # User-facing pages
│   ├── (admin)/                 # Admin dashboard
│   ├── (superadmin)/            # Superadmin panel
│   └── api/                     # API routes (server actions proxy)
├── components/
│   ├── ui/                      # Reusable UI primitives
│   └── [feature]/               # Feature-specific components
├── hooks/                       # Custom React hooks (useReports, useAuth, etc.)
├── lib/
│   ├── firebase/                # Firestore client & admin SDK init
│   ├── auth/                    # Auth.js config & session helpers
│   ├── blob/                    # Vercel Blob upload helpers
│   └── validations/             # Zod schemas
├── actions/                     # Next.js Server Actions
├── constants/                   # App-wide constants (roles, statuses, routes)
└── types/                       # TypeScript type definitions
```

---

## Naming Conventions

| Item              | Convention           | Example                        |
| ----------------- | -------------------- | ------------------------------ |
| Components        | PascalCase           | `ReportCard.tsx`               |
| Hooks             | camelCase + `use`    | `useReports.ts`                |
| Server Actions    | camelCase + verb     | `submitReport.ts`              |
| Constants         | SCREAMING_SNAKE_CASE | `REPORT_STATUS.PENDING`        |
| Firestore helpers | camelCase            | `getReportById.ts`             |
| Types/Interfaces  | PascalCase + suffix  | `ReportDocument`, `UserRole`   |

---

## Workflows

- Always verify changes locally before asking for review.
- Follow the defined workflows in `.agent/workflows/`.
- Each workflow file maps to a phase of development — follow them in order for new features.
- Never skip the testing workflow before deployment.
