"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { HAZARD_TYPES } from "@/constants";
import { DateFilterRange, isWithinDateRange } from "@/lib/utils";
import { fetchReportResponseTime } from "@/lib/reportsHelper";

export async function getAnalytics(dateFilter: DateFilterRange = "hari") {
  const session = await auth();
  if (session?.user.role !== "superadmin") throw new Error("Unauthorized");

  const reportsSnap = await adminDb.collection("reports").get();
  
  // Filter by date first
  const reports = reportsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r: any) => {
        // Laporan spam tidak boleh mengotori metrik.
        if (r.isSpam === true) return false;
        const dateStr = r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000) : null;
        return isWithinDateRange(dateStr, dateFilter);
    });

  const total = reports.length;
  const pending = reports.filter((r: any) => r.status === "pending").length;
  const confirmed = reports.filter((r: any) => r.status === "confirmed").length;
  const done = reports.filter((r: any) => r.status === "done").length;

  const pendingList = reports
    .filter((r: any) => r.status === "pending")
    .map((r: any) => ({
      id: r.id,
      description: r.description,
      locationName: r.location?.name || "Lokasi tidak diketahui",
      createdAt: r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toISOString() : null,
    }))
    .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0))
    .slice(0, 5); // top 5 oldest/newest? let's do newest.

  const sourceCounts: Record<string, number> = {};
  reports.forEach((r: any) => {
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
  const responsePromises = reportsSnap.docs.map(async (doc) => {
    const data = doc.data();
    if (data.isSpam === true) return null;
    if (data.status !== "confirmed" && data.status !== "done") return null;
    
    // Check if this document falls into our date range
    const docDate = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null;
    if (!isWithinDateRange(docDate, dateFilter)) return null;

    return fetchReportResponseTime(doc.id, data.createdAt?.seconds);
  });

  const responseResults = await Promise.all(responsePromises);
  const responseTimes = responseResults.filter((time): time is number => time !== null);

  const avgResponseMinutes =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : null;

  return { total, pending, confirmed, done, avgResponseMinutes, topSources, pendingList };
}
