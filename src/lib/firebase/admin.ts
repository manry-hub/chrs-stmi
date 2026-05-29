import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Use a global variable to persist the Firestore instance across HMR in development
const globalForFirebase = global as unknown as { adminDb: ReturnType<typeof getFirestore> };

if (!getApps().length && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

if (!globalForFirebase.adminDb && getApps().length > 0) {
  const db = getFirestore();
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch (e) {
    // Ignore initialization errors during HMR
  }
  globalForFirebase.adminDb = db;
}

export const adminDb = globalForFirebase.adminDb || ({} as ReturnType<typeof getFirestore>);
