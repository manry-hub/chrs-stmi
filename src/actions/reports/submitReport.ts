"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { submitReportSchema } from "@/lib/validations/report";
import { FieldValue } from "firebase-admin/firestore";

import { sendPushToAdmins, sendPushToAll } from "@/lib/notifications/sendPush";

export async function submitReport(formData: unknown) {
  const session = await auth();
  if (!session?.user?.role) {
    throw new Error("Sesi tidak valid atau Anda tidak memiliki akses. Silakan login kembali.");
  }

  if (!session.user.id) {
    throw new Error("ID Pengguna tidak ditemukan dalam sesi. Silakan logout dan login kembali untuk menyegarkan sesi Anda.");
  }

  console.log("SubmitReport Input:", JSON.stringify(formData, null, 2));
  const data = submitReportSchema.parse(formData);

  if (data.draftId) {
    // Idempotency check: Ensure we don't duplicate offline drafts
    const existingSnap = await adminDb.collection("reports")
        .where("userId", "==", session.user.id)
        .where("draftId", "==", data.draftId)
        .limit(1)
        .get();

    if (!existingSnap.empty) {
        console.log(`Report with draftId ${data.draftId} already exists. Skipping creation.`);
        return { success: true, reportId: existingSnap.docs[0].id };
    }
  }

  const reportRef = adminDb.collection("reports").doc();

  await reportRef.set({
    userId: session.user.id,
    userName: session.user.name || "Anonim",
    ...data,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Write initial log to subcollection
  await reportRef.collection("logs").add({
    action: "created",
    performedBy: session.user.id,
    note: `Laporan dibuat oleh ${session.user.name || "user"}`,
    createdAt: FieldValue.serverTimestamp(),
  });

  const reportDetailUrl = `/admin/reports/${reportRef.id}`;
  const locationName = data.location.name;
  const reporterName = session.user.name || "Seorang user";

  // Send push notification to assigned admin + superadmins (fire and forget)
  sendPushToAdmins({
    title: "Laporan Bahaya Baru!",
    body: `${reporterName} baru saja melaporkan bahaya di ${locationName}.`,
    url: reportDetailUrl,
  }, data.assignedAdminId).catch(err => console.error("Critical error in report submission push:", err));

  // Send push notification to ALL subscribed users (civitas), excluding the reporter
  sendPushToAll({
    title: "⚠️ Laporan Bahaya Baru",
    body: `${reporterName} melaporkan: ${data.description} di ${locationName}.${data.additionalMessage ? ` Pesan: ${data.additionalMessage}` : ""}`,
    url: reportDetailUrl,
  }, session.user.id).catch(err => console.error("Error sending push to all:", err));

  return { success: true, reportId: reportRef.id };
}
