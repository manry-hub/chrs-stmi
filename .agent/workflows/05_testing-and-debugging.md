---
description: optional
---

# 05 — Testing & Debugging

## Goal

Verify correctness of all features across user, admin, and superadmin roles before deployment. Covers manual test checklists, unit testing for Server Actions, and debugging common Firestore + Auth.js issues.

---

## Testing Stack

| Tool                    | Purpose                        |
| ----------------------- | ------------------------------ |
| Vitest                  | Unit & integration tests       |
| React Testing Library   | Component rendering tests      |
| Firebase Emulator Suite | Local Firestore + Auth testing |
| Playwright (optional)   | End-to-end flows               |

---

## Step 1 — Set Up Firebase Emulator

The emulator lets you test Firestore writes/reads and security rules without touching production data.

### Install & Configure

```bash
npm install -D firebase-tools
npx firebase init emulators
# Enable: Firestore, Auth
```

`firebase.json`:

```json
{
    "emulators": {
        "auth": { "port": 9099 },
        "firestore": { "port": 8080 },
        "ui": { "enabled": true, "port": 4000 }
    }
}
```

Start emulators:

```bash
npx firebase emulators:start
```

### Connect App to Emulator (Test Environment)

```ts
// src/lib/firebase/client.ts — add after init
if (process.env.NODE_ENV === "test") {
    connectFirestoreEmulator(db, "localhost", 8080);
}
```

---

## Step 2 — Unit Tests for Server Actions

### Test: `submitReport`

File: `src/actions/reports/__tests__/submitReport.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitReport } from "../submitReport";

// Mock auth session
vi.mock("@/lib/auth", () => ({
    auth: vi.fn().mockResolvedValue({
        user: { id: "user-123", name: "Hilman", role: "user" },
    }),
}));

// Mock Firestore admin
vi.mock("@/lib/firebase/admin", () => ({
    adminDb: {
        collection: vi.fn().mockReturnThis(),
        doc: vi.fn().mockReturnThis(),
        set: vi.fn().mockResolvedValue(undefined),
        collection: vi.fn().mockReturnValue({
            add: vi.fn().mockResolvedValue({ id: "log-1" }),
        }),
        id: "report-abc",
    },
}));

describe("submitReport", () => {
    it("should create report and log for valid user", async () => {
        const result = await submitReport({
            description: "Lantai licin di gedung A",
            location: { name: "Gedung A Lantai 1" },
            imageUrl: "https://blob.vercel-storage.com/test.jpg",
        });
        expect(result.success).toBe(true);
    });

    it("should throw Unauthorized for non-user role", async () => {
        vi.mocked(auth).mockResolvedValueOnce({
            user: { role: "admin" },
        });
        await expect(submitReport({})).rejects.toThrow("Unauthorized");
    });

    it("should throw validation error for missing description", async () => {
        await expect(submitReport({ location: { name: "A" }, imageUrl: "https://x.com/a.jpg" })).rejects.toThrow();
    });
});
```

### Test: `confirmReport`

File: `src/actions/reports/__tests__/confirmReport.test.ts`

Key scenarios to cover:

- ✅ Admin confirms a pending report → status updated, log written
- ✅ Superadmin can also confirm
- ❌ User cannot confirm → throws Unauthorized
- ❌ Already confirmed report → throws error
- ❌ Non-existent reportId → throws "tidak ditemukan"

### Test: `updateUserRole`

Key scenarios:

- ✅ Superadmin changes another user's role
- ❌ Non-superadmin → Unauthorized
- ❌ Superadmin changes own role → throws "Tidak dapat mengubah role sendiri"

---

## Step 3 — Security Rules Testing

File: `firestore.rules.test.ts` (run with `firebase emulators:exec`)

Use `@firebase/rules-unit-testing`:

```bash
npm install -D @firebase/rules-unit-testing
```

```ts
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

describe("Firestore Security Rules", () => {
    let testEnv;

    beforeAll(async () => {
        testEnv = await initializeTestEnvironment({
            projectId: "hazard-report-test",
            firestore: { rules: fs.readFileSync("firestore.rules", "utf8") },
        });
    });

    afterAll(() => testEnv.cleanup());

    it("unauthenticated user can READ reports", async () => {
        const db = testEnv.unauthenticatedContext().firestore();
        await assertSucceeds(getDoc(doc(db, "reports/report-1")));
    });

    it("user cannot UPDATE report status directly", async () => {
        const db = testEnv.authenticatedContext("user-123", { role: "user" }).firestore();
        await assertFails(updateDoc(doc(db, "reports/report-1"), { status: "confirmed" }));
    });

    it("admin can UPDATE report status", async () => {
        const db = testEnv.authenticatedContext("admin-1", { role: "admin" }).firestore();
        await assertSucceeds(updateDoc(doc(db, "reports/report-1"), { status: "confirmed" }));
    });

    it("user cannot write to logs subcollection", async () => {
        const db = testEnv.authenticatedContext("user-123", { role: "user" }).firestore();
        await assertFails(addDoc(collection(db, "reports/report-1/logs"), { action: "confirmed" }));
    });
});
```

---

## Step 4 — Manual Test Checklist

Run through this checklist in your local environment before any deployment.

### 🔐 Auth

- [ ] Register with valid data → user doc created in Firestore with `role: "user"`
- [ ] Register with duplicate email → error shown in form
- [ ] Login with correct credentials → redirected to `/dashboard`
- [ ] Login with wrong password → error toast shown
- [ ] Access `/admin` as `user` → redirected to `/login`
- [ ] Access `/superadmin` as `admin` → redirected to `/login`
- [ ] Logout → session cleared, redirected to `/login`

### 📋 User — Report Submission

- [ ] Submit form without image → validation error shown
- [ ] Submit form with description < 10 chars → validation error shown
- [ ] Upload image > 5MB → error toast shown
- [ ] Submit valid report → appears in `/dashboard/reports` in real-time
- [ ] Geolocation prompt appears and fills lat/lng fields
- [ ] Emergency call button → opens phone dialer with correct number

### 👮 Admin — Dashboard & Confirmation

- [ ] Admin dashboard loads all reports in real-time
- [ ] Filter "Belum Dikonfirmasi" shows only pending reports
- [ ] Filter "Dikonfirmasi" shows only confirmed reports
- [ ] Click report → detail page with image, location, description visible
- [ ] Confirm button visible for pending reports
- [ ] Confirm button hidden for confirmed reports
- [ ] Confirm action → status badge changes to "Dikonfirmasi" instantly
- [ ] Activity log timeline shows "created" and "confirmed" entries after confirmation

### 🛡️ Superadmin — Management

- [ ] Analytics page shows correct totals
- [ ] Average response time is non-zero after at least one confirmation
- [ ] User table shows all registered users
- [ ] Change user role from dropdown → persisted after page refresh
- [ ] Delete user → user removed from table
- [ ] Superadmin cannot delete or demote themselves

---

## Step 5 — Common Issues & Debugging

### Auth.js: Role not appearing in session

**Symptom**: `session.user.role` is `undefined`

**Fix**: Confirm the `jwt` and `session` callbacks in `auth.ts` are setting the role:

```ts
callbacks: {
  jwt({ token, user }) {
    if (user) token.role = (user as any).role; // set on first sign-in
    return token;
  },
  session({ session, token }) {
    session.user.role = token.role as UserRole;
    return session;
  },
}
```

---

### Firestore: "Missing or insufficient permissions"

**Symptom**: Client-side Firestore write/read fails with permission error

**Fix steps**:

1. Check `firestore.rules` — ensure the rule covers the operation
2. Ensure the user is authenticated before calling Firestore
3. Remember: `logs` subcollection writes are blocked for all clients → they must go through Admin SDK via Server Actions

---

### Firestore: "The query requires an index"

**Symptom**: Compound query (e.g., `where` + `orderBy`) fails in production

**Fix**:

1. Click the link in the Firebase console error — it auto-creates the index
2. Or manually add to `firestore.indexes.json` and deploy:

```bash
npx firebase deploy --only firestore:indexes
```

---

### Vercel Blob: Upload fails in development

**Symptom**: `BLOB_READ_WRITE_TOKEN` error or `403 Forbidden` on upload

**Fix**: Ensure `.env.local` has `BLOB_READ_WRITE_TOKEN` set. Get the token from Vercel dashboard → Storage → your Blob store → Settings.

---

### Real-Time Listener: Memory leak / "Can't perform state update on unmounted component"

**Symptom**: Console warning after navigating away from a page with `onSnapshot`

**Fix**: Always return the unsubscribe function from `useEffect`:

```tsx
useEffect(() => {
    const unsub = subscribeToAllReportsAdmin(setReports);
    return unsub; // ← this is the cleanup
}, []);
```

---

### Next.js: Server Action called from Client Component crashes with "Admin SDK not available"

**Symptom**: Firebase Admin SDK throws in Client Component

**Fix**: Admin SDK is only for server-side. Never import `src/lib/firebase/admin.ts` inside a Client Component or a file that's imported by one. Use Server Actions as the bridge.

---

## Definition of Done

- [ ] All unit tests pass (`npx vitest run`)
- [ ] All Firestore security rule tests pass
- [ ] Manual checklist fully completed with no blockers
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console errors in browser dev tools during manual testing
- [ ] Real-time listeners clean up properly (no memory leak warnings)
