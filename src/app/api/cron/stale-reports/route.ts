import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { sendPushToSuperadmins } from "@/lib/notifications/sendPushToSuperadmins";
import { getNotificationSettings } from "@/actions/notifications/notificationSettings";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Cron endpoint: Check for stale (pending) reports that have not been confirmed
 * within the configurable threshold (default 2 hours).
 * 
 * Protected by CRON_SECRET in Authorization header.
 * Designed to be called by Vercel Cron every 30 minutes.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get configurable threshold
    const settings = await getNotificationSettings();
    const thresholdHours = settings.staleReportThresholdHours;
    const thresholdMs = thresholdHours * 60 * 60 * 1000;
    const cutoffTime = new Date(Date.now() - thresholdMs);

    // Query all pending reports created before the cutoff time
    const pendingReports = await adminDb
      .collection("reports")
      .where("status", "==", "pending")
      .where("createdAt", "<=", cutoffTime)
      .get();

    if (pendingReports.empty) {
      return NextResponse.json({ message: "No stale reports found", count: 0 });
    }

    // Filter out reports that already received a reminder
    const staleReports = pendingReports.docs.filter((doc) => {
      const data = doc.data();
      return !data.reminderSentAt;
    });

    if (staleReports.length === 0) {
      return NextResponse.json({ message: "All stale reports already notified", count: 0 });
    }

    // Send notification to all superadmins
    const reportCount = staleReports.length;
    const firstReport = staleReports[0].data();
    const firstLocation = firstReport.location?.name || "Lokasi tidak diketahui";

    await sendPushToSuperadmins({
      title: `⏰ ${reportCount} Laporan Belum Dikonfirmasi!`,
      body: reportCount === 1
        ? `Laporan di ${firstLocation} sudah menunggu lebih dari ${thresholdHours} jam tanpa konfirmasi.`
        : `${reportCount} laporan sudah menunggu lebih dari ${thresholdHours} jam tanpa konfirmasi. Termasuk laporan di ${firstLocation}.`,
      url: "/superadmin/reports",
    });

    // Mark all stale reports as reminded
    const batch = adminDb.batch();
    for (const doc of staleReports) {
      batch.update(doc.ref, {
        reminderSentAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();

    return NextResponse.json({
      message: `Notified superadmins about ${reportCount} stale reports`,
      count: reportCount,
    });
  } catch (error) {
    console.error("Error in stale-reports cron:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
