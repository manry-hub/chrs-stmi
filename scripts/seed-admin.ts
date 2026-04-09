// Temporary seed script to create test accounts for admin and superadmin roles
// Run with: npx tsx scripts/seed-admin.ts

import * as admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load service account from the JSON file in project root
const serviceAccountPath = resolve(__dirname, "../chrs-76a98-firebase-adminsdk-fbsvc-0096ca6467.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const TEST_USERS = [
  {
    email: "superadmin@hazardreport.test",
    password: "Super@dmin123",
    name: "Super Admin",
    phone: "081200000001",
    role: "superadmin",
  },
  {
    email: "ob@hazardreport.test",
    password: "Ob@dmin123",
    name: "OB Satpam",
    phone: "081200000002",
    role: "admin",
  },
];

async function seed() {
  for (const user of TEST_USERS) {
    try {
      // Check if user already exists in Firebase Auth
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(user.email);
        console.log(`✓ User already exists: ${user.email} (uid: ${userRecord.uid})`);
      } catch {
        // User doesn't exist, create it
        userRecord = await admin.auth().createUser({
          email: user.email,
          password: user.password,
          displayName: user.name,
        });
        console.log(`✓ Created Firebase Auth user: ${user.email} (uid: ${userRecord.uid})`);
      }

      // Upsert Firestore user document
      await db.collection("users").doc(userRecord.uid).set(
        {
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      console.log(`✓ Set Firestore role for ${user.email} → ${user.role}`);
    } catch (err) {
      console.error(`✗ Failed for ${user.email}:`, err);
    }
  }

  console.log("\n--- Done! ---\n");
  console.log("Credentials:");
  console.log("┌──────────────┬──────────────────────────────────┬─────────────────┐");
  console.log("│ Role         │ Email                            │ Password        │");
  console.log("├──────────────┼──────────────────────────────────┼─────────────────┤");
  console.log("│ superadmin   │ superadmin@hazardreport.test      │ Super@dmin123   │");
  console.log("│ admin (OB)   │ ob@hazardreport.test              │ Ob@dmin123      │");
  console.log("└──────────────┴──────────────────────────────────┴─────────────────┘");

  process.exit(0);
}

seed();
