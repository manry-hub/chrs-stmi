"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { HAZARD_TYPES } from "@/constants";

export async function getAnalytics() {
  const session = await auth();
  if (session?.user.role !== "superadmin") throw new Error("Unauthorized");

  const reportsSnap = await adminDb.collection("reports").get();
  const reports = reportsSnap.docs.map((d) => d.data());

  const total = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const confirmed = reports.filter((r) => r.status === "confirmed").length;
  const done = reports.filter((r) => r.status === "done").length;

  const sourceCounts: Record<string, number> = {};
  reports.forEach((r) => {
    if (r.description) {
      sourceCounts[r.description] = (sourceCounts[r.description] || 0) + 1;
    }
  });

  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([value, count]) => {
      const hazard = HAZARD_TYPES.find((h) => h.value === value);
      return {
        name: hazard ? hazard.label : value,
        count,
      };
    });

  // Average response time: createdAt → first "confirmed" log
  // Average response time logic relies on 'confirmed' or 'done' since 'done' implies it was confirmed previously
  // Wait, the rule is to fetch logs where action == "confirmed". That's fine.
  const responseTimes: number[] = [];

  for (const doc of reportsSnap.docs) {
    if (doc.data().status !== "confirmed" && doc.data().status !== "done") continue;
    const logsSnap = await adminDb
      .collection("reports")
      .doc(doc.id)
      .collection("logs")
      .where("action", "==", "confirmed")
      .orderBy("createdAt", "asc")
      .limit(1)
      .get();

    if (!logsSnap.empty) {
      const created = doc.data().createdAt?.seconds ?? 0;
      const confirmedTime = logsSnap.docs[0].data().createdAt?.seconds ?? 0;
      if (created && confirmedTime) {
        responseTimes.push((confirmedTime - created) / 60); // minutes
      }
    }
  }

  const avgResponseMinutes =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : null;

  return { total, pending, confirmed, done, avgResponseMinutes, topSources };
}
