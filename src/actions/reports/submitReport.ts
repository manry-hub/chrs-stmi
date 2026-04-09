"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { submitReportSchema } from "@/lib/validations/report";
import { FieldValue } from "firebase-admin/firestore";

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

  return { success: true, reportId: reportRef.id };
}
