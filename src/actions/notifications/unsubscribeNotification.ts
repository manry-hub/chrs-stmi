"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function unsubscribeNotification() {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized.");
  }

  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User ID not found in session.");
  }

  try {
    await adminDb.collection("pushSubscriptions").doc(userId).delete();
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting push subscription:", error);
    return { success: false, error: "Gagal menghapus subscription notifikasi." };
  }
}
