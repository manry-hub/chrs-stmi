"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Use a more permissive type for the subscription object from the client
export async function subscribeNotification(subscription: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}) {
  const session = await auth();

  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    throw new Error("Unauthorized. Only admins can subscribe to notifications.");
  }

  const userId = session.user.id;

  if (!userId) {
    throw new Error("User ID not found in session.");
  }

  try {
    await adminDb.collection("pushSubscriptions").doc(userId).set({
      subscription,
      userId,
      role: session.user.role,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return { success: false, error: "Gagal menyimpan subscription notifikasi." };
  }
}
