const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function check() {
  const snapshot = await db.collection('reports').get();
  console.log(`Total reports: ${snapshot.size}`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Report ${doc.id}: locationId=${data.locationId}, assignedAdminId=${data.assignedAdminId}, locationName=${data.location?.name}`);
  });
}

check().catch(console.error);
