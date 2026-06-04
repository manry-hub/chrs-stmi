"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function deleteReport(reportId: string) {
  const session = await auth();
  if (session?.user.role !== "superadmin") {
    throw new Error("Unauthorized: Only superadmin can delete reports");
  }

  try {
    const reportRef = adminDb.collection("reports").doc(reportId);
    const logsRef = reportRef.collection("logs");

    // Attempt to delete any nested logs
    const logsSnapshot = await logsRef.get();
    if (!logsSnapshot.empty) {
      const batch = adminDb.batch();
      logsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Delete the target report document
    await reportRef.delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting report:", error);
    throw new Error("Failed to delete the report from the database.");
  }
}
