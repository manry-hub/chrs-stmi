"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

const markSpamSchema = z.object({
  reportId: z.string().min(1),
  isSpam: z.boolean(),
});

/**
 * Menandai laporan sebagai spam, atau membatalkan tandanya.
 *
 * Sengaja tidak memakai status laporan: pending/confirmed/done menggambarkan
 * penanganan, sedangkan spam menggambarkan keabsahan. Laporan bertanda spam
 * disembunyikan dari daftar publik, tidak dihitung dalam analitik dan performa,
 * tapi tidak dihapus sehingga keputusan petugas tetap bisa ditinjau ulang.
 */
export async function markReportSpam(input: unknown) {
  const session = await auth();

  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const { reportId, isSpam } = markSpamSchema.parse(input);

  const reportRef = adminDb.collection("reports").doc(reportId);
  const reportSnap = await reportRef.get();
  if (!reportSnap.exists) throw new Error("Laporan tidak ditemukan");

  await reportRef.update({
    isSpam,
    spamMarkedBy: isSpam ? session.user.id : FieldValue.delete(),
    spamMarkedAt: isSpam ? FieldValue.serverTimestamp() : FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await reportRef.collection("logs").add({
    action: isSpam ? "marked_spam" : "unmarked_spam",
    performedBy: session.user.id,
    note: isSpam
      ? `Ditandai sebagai spam oleh ${session.user.name || "petugas"}`
      : `Tanda spam dibatalkan oleh ${session.user.name || "petugas"}`,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
}
