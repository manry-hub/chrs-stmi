"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function unsubscribeNotification(deviceId?: string) {
  const session = await auth();
  const docId = session?.user?.id || deviceId;

  if (!docId) {
    return { success: false, error: "Identitas perangkat tidak ditemukan." };
  }

  try {
    await adminDb.collection("pushSubscriptions").doc(docId).delete();
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting push subscription:", error);
    return { success: false, error: "Gagal menghapus subscription notifikasi." };
  }
}
