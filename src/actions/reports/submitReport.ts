"use server";

import { adminDb } from "@/lib/firebase/admin";
import { submitReportSchema } from "@/lib/validations/report";
import { REPORTER_SOURCE } from "@/constants";
import { checkRateLimit } from "@/lib/rateLimitStore";
import { isWithinSTMI } from "@/lib/utils/geofence";
import { FieldValue } from "firebase-admin/firestore";

import { sendPushToAdmins, sendPushToAll } from "@/lib/notifications/sendPush";

/**
 * Mengirim laporan bahaya. Terbuka untuk publik: civitas akademika melapor
 * tanpa login, identitasnya berupa nama yang diisi sendiri pada form plus
 * `deviceId` (identitas lemah per-perangkat, bukan akun).
 */
export async function submitReport(formData: unknown) {
  // Data submission removed from console logs to prevent sensitive data leakage
  const { reporterName, deviceId, draftId, ...data } = submitReportSchema.parse(formData);

  // Dibatasi per perangkat, bukan per IP: WiFi kampus berada di balik NAT
  // sehingga limit per-IP akan menjegal seluruh civitas sekaligus.
  if (deviceId) {
    const { success } = await checkRateLimit("report", deviceId, 5, 60 * 60 * 1000);
    if (!success) {
      throw new Error("Terlalu banyak laporan dari perangkat ini. Coba lagi dalam satu jam.");
    }
  }

  // Geofence diverifikasi ulang di sini. Pengecekan di klien hanya pagar UX:
  // endpoint ini publik, jadi koordinat apa pun bisa dikirim langsung.
  const geofenceEnabled =
    (process.env.NEXT_PUBLIC_ENABLE_GEOFENCING || "").replace(/['"]/g, "").trim().toLowerCase() === "true";

  const { lat, lng } = data.location;
  const hasCoordinates = typeof lat === "number" && typeof lng === "number";

  if (geofenceEnabled && hasCoordinates && !isWithinSTMI(lat, lng)) {
    throw new Error("Laporan ditolak: lokasi berada di luar kawasan Politeknik STMI Jakarta.");
  }

  // Laporan tanpa koordinat tetap diterima: GPS sering gagal mendapatkan fix di
  // dalam gedung, dan menolaknya berarti membuang laporan bahaya yang sah.
  // Penandanya dipakai petugas untuk meninjau sendiri keabsahannya.
  //
  // Dibiarkan undefined saat geofencing mati: tidak ada kebijakan lokasi yang
  // berlaku, jadi menandai "belum terverifikasi" pada setiap laporan hanya
  // menghasilkan peringatan yang tidak berarti. Firestore mengabaikan undefined.
  const locationVerified = geofenceEnabled ? hasCoordinates : undefined;

  const reportRef = adminDb.collection("reports").doc();
  let existingReportId: string | null = null;

  // Satu transaksi menangani tiga hal sekaligus:
  //  1. idempotency draft offline (draftId adalah UUIDv4, unik secara global)
  //  2. race saat dua tab menyinkronkan draft yang sama
  //  3. atomisitas dokumen laporan bersama log pertamanya
  await adminDb.runTransaction(async (tx) => {
    if (draftId) {
      const duplicates = await tx.get(
        adminDb.collection("reports").where("draftId", "==", draftId).limit(1)
      );

      if (!duplicates.empty) {
        existingReportId = duplicates.docs[0].id;
        return;
      }
    }

    tx.set(reportRef, {
      userId: null,
      userName: reporterName,
      reporterSource: REPORTER_SOURCE.PUBLIC,
      locationVerified,
      ...(deviceId ? { deviceId } : {}),
      ...(draftId ? { draftId } : {}),
      ...data,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.set(reportRef.collection("logs").doc(), {
      action: "created",
      performedBy: deviceId || "public",
      note: `Laporan dibuat oleh ${reporterName}`,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  if (existingReportId) {
    console.log(`Report with draftId ${draftId} already exists. Skipping creation.`);
    return { success: true, reportId: existingReportId as string };
  }

  const reportDetailUrl = `/admin/reports/${reportRef.id}`;
  const locationName = data.location.name;

  // Send push notification to assigned admin + superadmins (fire and forget)
  sendPushToAdmins({
    title: "Laporan Bahaya Baru!",
    body: `${reporterName} baru saja melaporkan bahaya di ${locationName}.`,
    url: reportDetailUrl,
  }, data.assignedAdminId).catch(err => console.error("Critical error in report submission push:", err));

  // Send push notification to ALL subscribed devices (civitas), excluding the reporter's device
  sendPushToAll({
    title: "⚠️ Laporan Bahaya Baru",
    body: `${reporterName} melaporkan: ${data.description} di ${locationName}.${data.additionalMessage ? ` Pesan: ${data.additionalMessage}` : ""}`,
    url: reportDetailUrl,
  }, deviceId).catch(err => console.error("Error sending push to all:", err));

  return { success: true, reportId: reportRef.id };
}
