---
description: last
---

# 06 — Deployment to Vercel

## Goal

Deploy the application to Vercel (production), configure all environment variables, deploy Firestore rules and indexes, and verify PWA readiness.

---

## Prerequisites

- [ ] Workflow `05_testing-and-debugging.md` completed and all checks passed
- [ ] Vercel account connected to your GitHub repository
- [ ] Firebase project in production mode (not emulator)
- [ ] Vercel Blob storage enabled in Vercel dashboard

---

## Step 1 — Pre-Deployment Checklist

Run these locally before pushing to main:

```bash
# Type check
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx

# Build — must succeed with zero errors
npx next build
```

Verify:

- [ ] `next build` completes without errors
- [ ] No `any` type errors
- [ ] No missing environment variable warnings in build output
- [ ] Bundle size is reasonable — check `.next/analyze` if `@next/bundle-analyzer` is configured

---

## Step 2 — Environment Variables on Vercel

Go to **Vercel Dashboard → Project → Settings → Environment Variables** and add all of the following for **Production** (and optionally Preview/Development):

```
# Firebase Client SDK (public — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Firebase Admin SDK (private — never expose client-side)
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY       ← paste the full key, including -----BEGIN...

# Auth.js
AUTH_SECRET                      ← generate with: openssl rand -base64 32
NEXTAUTH_URL                     ← https://your-app.vercel.app

# Vercel Blob
BLOB_READ_WRITE_TOKEN

# App config
NEXT_PUBLIC_EMERGENCY_NUMBER     ← e.g., +628123456789
```

> **Important**: `FIREBASE_ADMIN_PRIVATE_KEY` contains literal `\n` characters. In Vercel, paste the raw key exactly as it appears in your Firebase service account JSON — Vercel preserves newlines automatically. Do **not** manually escape them.

---

## Step 3 — Deploy Firestore Rules & Indexes

These must be deployed to Firebase separately from Vercel.

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login
npx firebase login

# Set project
npx firebase use your-firebase-project-id

# Deploy only rules and indexes (not hosting)
npx firebase deploy --only firestore:rules,firestore:indexes
```

Verify in Firebase Console:

- [ ] Firestore → Rules tab shows the new rules and they are "Published"
- [ ] Firestore → Indexes tab shows all indexes with status "Enabled"

---

## Step 4 — Deploy to Vercel

### Option A — Automatic (Recommended)

1. Push to `main` branch on GitHub
2. Vercel detects the push and auto-deploys
3. Watch build logs in Vercel dashboard

### Option B — Manual via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Step 5 — Post-Deployment Verification

After deployment completes, verify the live URL:

### Auth Flow

- [ ] `/login` loads correctly
- [ ] `/register` loads correctly
- [ ] Register a new test user → user appears in Firestore console
- [ ] Login → session works, redirects to `/dashboard`
- [ ] Accessing `/admin` as `user` role → redirects to `/login`

### User Flow

- [ ] Submit a report with image → image appears in Vercel Blob, report in Firestore
- [ ] Report appears in `/dashboard/reports` without refresh
- [ ] Emergency call button triggers phone dialer

### Admin Flow

- [ ] Login as admin → `/admin` dashboard loads with real-time reports
- [ ] Confirm a report → status updates in real-time
- [ ] Activity log shows "confirmed" entry

### Superadmin Flow

- [ ] Analytics page shows correct counts
- [ ] User management table loads all users
- [ ] Role change persists after page refresh

---

## Step 6 — PWA Configuration

The app should be installable on mobile as a Progressive Web App.

### Setup with `next-pwa`

```bash
npm install next-pwa
```

`next.config.ts`:

```ts
import withPWA from "next-pwa";

const nextConfig = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development", // don't cache in dev
})({
    // your existing next config
});

export default nextConfig;
```

### Web App Manifest

File: `public/manifest.json`

```json
{
    "name": "HazardReport",
    "short_name": "HazardReport",
    "description": "Sistem pelaporan bahaya kampus secara real-time",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#ef4444",
    "icons": [
        { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
        { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
}
```

Add to `src/app/layout.tsx`:

```tsx
export const metadata = {
    manifest: "/manifest.json",
    themeColor: "#ef4444",
};
```

### Verify PWA

- Open the live URL on mobile Chrome
- DevTools → Application → Manifest → no errors
- DevTools → Application → Service Workers → status "Activated and running"
- "Add to Home Screen" prompt appears or is available in browser menu

---

## Step 7 — Performance Check

Run Lighthouse on the production URL:

```bash
# Or use Chrome DevTools → Lighthouse tab
npx lighthouse https://your-app.vercel.app --output=html --view
```

Targets from PRD:

| Metric                 | Target      |
| ---------------------- | ----------- |
| Performance            | ≥ 80        |
| First Contentful Paint | < 2 seconds |
| PWA score              | ≥ 90        |
| Accessibility          | ≥ 85        |

If performance is below target:

- Add `priority` prop to above-the-fold `<Image>` components
- Ensure Server Components are used for data-fetching pages
- Check for unnecessary `"use client"` directives

---

## Step 8 — Domain (Optional)

If attaching a custom domain:

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain and follow DNS instructions
3. Update `NEXTAUTH_URL` environment variable to the new domain
4. Update Firebase Auth → Authorized Domains (Firebase Console → Auth → Settings)

---

## Rollback Plan

If a deployment breaks production:

```bash
# Via Vercel CLI — list deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url> --prod
```

Or via Vercel Dashboard → Deployments → select a previous deployment → "Promote to Production."

---

## Definition of Done

- [ ] `next build` passes locally with zero errors
- [ ] All environment variables set in Vercel for Production
- [ ] Firestore rules and indexes deployed to Firebase
- [ ] Production URL loads without errors (check Vercel function logs)
- [ ] Auth, user, admin, and superadmin flows verified on live URL
- [ ] PWA installable on mobile Chrome
- [ ] Lighthouse Performance ≥ 80 and FCP < 2s
- [ ] No secrets or private keys exposed in client-side bundles (`NEXT_PUBLIC_` only for safe values)
