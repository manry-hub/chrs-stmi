import { adminDb } from "../src/lib/firebase/admin";
import * as admin from "firebase-admin";

async function seedUser(email: string, role: string, name: string) {
  let uid = "";
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    uid = userRecord.uid;
    // Update password just in case
    await admin.auth().updateUser(uid, { password: "TestUser@123" });
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      const userRecord = await admin.auth().createUser({
        email,
        password: "TestUser@123",
        displayName: name,
      });
      uid = userRecord.uid;
    } else {
      throw error;
    }
  }

  // Upsert in Firestore
  await adminDb.collection("users").doc(uid).set({
    name,
    email,
    role,
    phone: "081234567890",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`Seeded user ${email} with role ${role}`);
}

async function globalSetup() {
  console.log("Running global setup: Seeding test users...");
  try {
    await seedUser("testuser@hazardreport.test", "user", "Test User");
    await seedUser("testadmin@hazardreport.test", "admin", "Test Admin");
    await seedUser("testsuperadmin@hazardreport.test", "superadmin", "Test Superadmin");

    // Seed a test location so user-journey has something to select
    const locationRef = adminDb.collection("locations").doc("test-location-1");
    await locationRef.set({
      name: "Toilet Lantai 2 Gedung C",
      adminIds: ["admin-id-1"], // dummy
      adminNames: ["Test Admin"],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Seed a test hazard type
    const hazardRef = adminDb.collection("hazardTypes").doc("test-hazard-1");
    await hazardRef.set({
      name: "Kabel Terkelupas",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  } catch (err) {
    console.error("Failed to seed users in global setup:", err);
  }
}

export default globalSetup;
