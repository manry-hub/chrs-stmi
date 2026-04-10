"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { submitReportSchema } from "@/lib/validations/report";
import { FieldValue } from "firebase-admin/firestore";

import { sendPushToAdmins } from "@/lib/notifications/sendPushToAdmins";

export async function submitReport(formData: unknown) {
  const session = await auth();
  if (!session || session.user.role !== "user") {
    throw new Error("Sesi tidak valid atau Anda tidak memiliki akses. Silakan login kembali.");
  }

  if (!session.user.id) {
    throw new Error("ID Pengguna tidak ditemukan dalam sesi. Silakan logout dan login kembali untuk menyegarkan sesi Anda.");
  }

  console.log("SubmitReport Input:", JSON.stringify(formData, null, 2));
  const data = submitReportSchema.parse(formData);

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
    note: "Laporan dibuat oleh user",
    createdAt: FieldValue.serverTimestamp(),
  });

  // Send push notification to all admins (fire and forget)
  sendPushToAdmins({
    title: "Laporan Bahaya Baru!",
    body: `${session.user.name || "Seorang user"} baru saja melaporkan bahaya di ${data.location.name}.`,
    url: "/superadmin/reports", // Or /admin depending on which one the admin uses
  }).catch(err => console.error("Critical error in report submission push:", err));

  return { success: true, reportId: reportRef.id };
}
