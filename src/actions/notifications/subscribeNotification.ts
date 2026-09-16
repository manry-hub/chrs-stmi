"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Use a more permissive type for the subscription object from the client
export async function subscribeNotification(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  deviceId?: string
) {
  // Admin & kepala CS tetap terikat akun. Civitas akademika kini publik, jadi
  // subscription-nya dikunci ke deviceId, bukan userId.
  const session = await auth();
  const userId = session?.user?.id;
  const docId = userId || deviceId;

  if (!docId) {
    return { success: false, error: "Identitas perangkat tidak ditemukan." };
  }

  try {
    await adminDb.collection("pushSubscriptions").doc(docId).set({
      subscription,
      userId: userId || null,
      deviceId: deviceId || null,
      role: session?.user?.role || "public",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return { success: false, error: "Gagal menyimpan subscription notifikasi." };
  }
}
