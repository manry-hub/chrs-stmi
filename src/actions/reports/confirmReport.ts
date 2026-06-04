"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

const confirmSchema = z.object({
  reportId: z.string().min(1),
  note: z.string().optional(),
});

export async function confirmReport(input: unknown) {
  const session = await auth();

  // Second-layer role check
  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const { reportId, note } = confirmSchema.parse(input);

  const reportRef = adminDb.collection("reports").doc(reportId);

  // Verify report exists and is still pending
  const reportSnap = await reportRef.get();
  if (!reportSnap.exists) throw new Error("Laporan tidak ditemukan");
  
  const reportData = reportSnap.data();
  if (reportData?.status === "confirmed") {
    throw new Error("Laporan sudah dikonfirmasi sebelumnya");
  }

  // Update report status
  await reportRef.update({
    status: "confirmed",
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Write audit log to subcollection
  await reportRef.collection("logs").add({
    action: "confirmed",
    performedBy: session.user.id,
    note: note ?? "Status diperbarui oleh admin",
    createdAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
}
