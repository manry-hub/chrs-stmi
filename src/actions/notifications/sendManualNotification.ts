"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { sendPushToAdmins } from "@/lib/notifications/sendPush";

/**
 * Send a manual push notification reminder from superadmin to the assigned admin
 * for a specific report.
 */
export async function sendManualNotification(reportId: string) {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    throw new Error("Unauthorized: Hanya superadmin yang dapat mengirim notifikasi manual.");
  }

  // Fetch report details
  const reportDoc = await adminDb.collection("reports").doc(reportId).get();
  if (!reportDoc.exists) {
    throw new Error("Laporan tidak ditemukan.");
  }

  const report = reportDoc.data();
  if (!report) {
    throw new Error("Data laporan kosong.");
  }

  const locationName = report.location?.name || "Lokasi tidak diketahui";
  const assignedAdminId = report.assignedAdminId;

  if (!assignedAdminId) {
    throw new Error("Laporan ini tidak memiliki penanggung jawab (admin) yang ditugaskan.");
  }

  // Send push to the assigned admin + all superadmins
  await sendPushToAdmins(
    {
      title: "🔔 Pengingat dari Kepala CS",
      body: `Laporan di ${locationName} belum ditindaklanjuti. Segera konfirmasi laporan ini.`,
      url: `/admin/reports/${reportId}`,
    },
    assignedAdminId
  );

  return { success: true };
}

/**
 * Send manual push notification reminders to all admins assigned to the provided reports.
 */
export async function sendBulkManualNotification(reportIds: string[]) {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    throw new Error("Unauthorized: Hanya superadmin yang dapat mengirim notifikasi manual.");
  }

  let successCount = 0;
  
  // We process them sequentially to avoid overwhelming, or could use Promise.allSettled
  for (const reportId of reportIds) {
    try {
      const reportDoc = await adminDb.collection("reports").doc(reportId).get();
      if (!reportDoc.exists) continue;
      
      const report = reportDoc.data();
      if (!report || !report.assignedAdminId) continue;
      
      const locationName = report.location?.name || "Lokasi tidak diketahui";
      
      await sendPushToAdmins(
        {
          title: "🔔 Pengingat dari Kepala CS",
          body: `Laporan di ${locationName} belum ditindaklanjuti. Segera konfirmasi laporan ini.`,
          url: `/admin/reports/${reportId}`,
        },
        report.assignedAdminId
      );
      
      successCount++;
    } catch (error) {
      console.error(`Failed to send bulk notification for report ${reportId}:`, error);
    }
  }

  if (successCount === 0 && reportIds.length > 0) {
    throw new Error("Gagal mengirim notifikasi ke semua laporan yang dipilih.");
  }

  return { success: true, count: successCount };
}
