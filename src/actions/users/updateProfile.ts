"use server";

import { adminDb } from "@/lib/firebase/admin";
import { updateProfileSchema } from "@/lib/validations/user";
import * as admin from "firebase-admin";
import { auth } from "@/lib/auth";

export async function updateProfile(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = updateProfileSchema.parse(formData);

  try {
    const updateAuthData: any = {};
    if (data.name) updateAuthData.displayName = data.name;
    if (data.password) updateAuthData.password = data.password;

    if (Object.keys(updateAuthData).length > 0) {
      await admin.auth().updateUser(session.user.id, updateAuthData);
    }

    const ref = adminDb.collection("users").doc(session.user.id);
    await ref.update({
      name: data.name,
      phone: data.phone,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.error("Error updating profile:", err);
    if (err instanceof Error) throw new Error(err.message);
    throw new Error("Gagal memperbarui profil");
  }
}
