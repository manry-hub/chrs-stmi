import * as fs from "fs";
const envStr = fs.readFileSync(".env.local", "utf-8");
envStr.split("\n").forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
            val = val.slice(1, -1);
        }
        process.env[key] = val;
    }
});

async function main() {
    const { adminDb } = await import("../src/lib/firebase/admin");
    const { FieldValue } = await import("firebase-admin/firestore");
    const { CAMPUS_LOCATIONS, HAZARD_TYPES } = await import("../src/constants");
    console.log("Seeding locations and hazard types...");
    const batch = adminDb.batch();

    // 1. Seed Hazard Types
    for (const hazard of HAZARD_TYPES) {
        const docRef = adminDb.collection("hazardTypes").doc(hazard.value);
        batch.set(docRef, {
            name: hazard.label,
            createdAt: FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    console.log(`Added ${HAZARD_TYPES.length} hazard types to batch.`);

    // 2. Seed Locations
    for (const loc of CAMPUS_LOCATIONS) {
        // use a slug as ID for cleaner URLs
        const locId = loc.value.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
        const docRef = adminDb.collection("locations").doc(locId);
        
        batch.set(docRef, {
            name: loc.label, // Includes the original name
            adminId: null, // To be assigned later
            adminName: null,
            createdAt: FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    console.log(`Added ${CAMPUS_LOCATIONS.length} locations to batch.`);

    await batch.commit();
    console.log("Seeding complete!");
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
