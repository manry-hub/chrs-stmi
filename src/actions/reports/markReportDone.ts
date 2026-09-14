"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

const markDoneSchema = z.object({
  reportId: z.string().min(1),
  proofImageUrl: z.string().url("URL gambar bukti tidak valid"),
  note: z.string().optional(),
});

export async function markReportDone(input: unknown) {
  const session = await auth();

  // Second-layer role check
  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const { reportId, proofImageUrl, note } = markDoneSchema.parse(input);

  const reportRef = adminDb.collection("reports").doc(reportId);

  // Verify report exists and is confirmed
  const reportSnap = await reportRef.get();
  if (!reportSnap.exists) throw new Error("Laporan tidak ditemukan");
  
  const reportData = reportSnap.data();
  if (reportData?.status !== "confirmed") {
    throw new Error("Laporan belum dikonfirmasi atau sudah selesai");
  }

  // Ensure only the CS who confirmed the report can mark it as done
  if (
    reportData?.confirmedBy &&
    reportData.confirmedBy !== session.user.id &&
    session.user.role !== "superadmin"
  ) {
    throw new Error("Hanya petugas yang mengkonfirmasi yang dapat menyelesaikan laporan ini.");
  }

  // Update report status
  await reportRef.update({
    status: "done",
    proofImageUrl,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Write audit log to subcollection
  await reportRef.collection("logs").add({
    action: "done",
    performedBy: session.user.id,
    note: note ?? `Tindak lanjut laporan telah diselesaikan oleh ${session.user.name || "admin"}`,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
}
