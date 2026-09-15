import { adminDb } from "../src/lib/firebase/admin";
import * as admin from "firebase-admin";

async function globalTeardown() {
  console.log("Running global teardown: Cleaning up test users and data...");
  
  // 1. Delete test users from Firebase Auth + Firestore
  const emails = [
    "testuser@hazardreport.test",
    "testadmin@hazardreport.test",
    "testsuperadmin@hazardreport.test"
  ];
  
  for (const email of emails) {
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().deleteUser(userRecord.uid);
      await adminDb.collection("users").doc(userRecord.uid).delete();
      console.log(`Deleted user ${email}`);
    } catch (e: any) {
      if (e.code !== "auth/user-not-found") {
        console.error(`Failed to delete user ${email}:`, e);
      }
    }
  }

  // 2. Delete test reports (created by user-journey)
  try {
    const reports = await adminDb.collection("reports")
      .where("formData.description", "==", "Kabel Terkelupas")
      .get();
    if (!reports.empty) {
      const batch = adminDb.batch();
      reports.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`Deleted ${reports.size} test report(s).`);
    }
  } catch (e) {
    console.error("Failed to cleanup reports:", e);
  }

  // 3. Delete test locations (created by global.setup + superadmin-journey)
  try {
    const locations = await adminDb.collection("locations")
      .where("name", "in", ["Toilet Lantai 2 Gedung C", "Gedung D Lantai 1"])
      .get();
    if (!locations.empty) {
      const batch = adminDb.batch();
      locations.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`Deleted ${locations.size} test location(s).`);
    }
  } catch (e) {
    console.error("Failed to cleanup locations:", e);
  }

  // 4. Delete test hazard types (created by global.setup + superadmin-journey)
  try {
    const hazards = await adminDb.collection("hazardTypes")
      .where("name", "in", ["Kabel Terkelupas", "Atap Bocor"])
      .get();
    if (!hazards.empty) {
      const batch = adminDb.batch();
      hazards.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`Deleted ${hazards.size} test hazard type(s).`);
    }
  } catch (e) {
    console.error("Failed to cleanup hazard types:", e);
  }

  console.log("Global teardown complete.");
}

export default globalTeardown;
