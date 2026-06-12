# 🚨 HazardReport
Real-Time Campus Hazard Reporting System

## Overview
HazardReport is a production-ready, real-time hazard reporting system designed specifically for campus environments. The platform streamlines the process of reporting campus hazards for students, lecturers, and staff, while providing administrators with a powerful dashboard to track, update, and resolve issues in real-time. 

## Features
- **Real-Time Dashboard:**
  Instant updates across all clients using Firestore `onSnapshot` listeners. Admins see new reports without refreshing.
- **Role-Based Access Control (RBAC):**
  Strict server-side role verification for `user` (submit & view reports), `admin` (update report status), and `superadmin` (manage users & roles).
- **Secure Authentication:**
  Integrated with Auth.js (NextAuth v5) using custom credentials.
- **Media Uploads:**
  Reliable and fast image uploads utilizing Vercel Blob.
- **Robust Validation:**
  Type-safe forms and API routes using React Hook Form and Zod.
- **Modern UI:**
  Responsive, clean, and accessible interface built with Tailwind CSS. (UI Language: Bahasa Indonesia).

## Project Structure
- `src/app/` - Next.js App Router including route groups (`(auth)`, `(user)`, `(admin)`, `(superadmin)`) and API routes.
- `src/components/` - Reusable UI primitives and feature-specific components.
- `src/hooks/` - Custom React hooks (e.g., `useReports`, `useAuth`).
- `src/lib/` - Core utilities including Firebase config, Auth config, Blob helpers, and Zod schemas.
- `src/actions/` - Next.js Server Actions for secure, server-side data mutations.
- `src/constants/` - Application-wide constants (roles, statuses).
- `src/types/` - TypeScript type definitions and interfaces.

## Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore
- **Authentication:** Auth.js (NextAuth v5)
- **Storage:** Vercel Blob
- **Forms & Validation:** React Hook Form + Zod

## Getting Started

### Prerequisites
- Node.js (v18 or above recommended)
- npm, pnpm, or yarn

### Installation
```bash
# Install dependencies
npm install

# or
pnpm install
```

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Auth.js Configuration
AUTH_SECRET=your_auth_secret_key

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Running Locally
```bash
npm run dev

# or
pnpm dev
```
Navigate to `http://localhost:3000` in your browser.

© 2026 HazardReport by manry-hub
