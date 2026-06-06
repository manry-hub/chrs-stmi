"use server";

import { adminDb } from "@/lib/firebase/admin";
import { updateUserSchema } from "@/lib/validations/user";
import * as admin from "firebase-admin";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface UpdateUserArgs {
  userId: string;
  data: unknown;
}

export async function updateUser({ userId, data: formData }: UpdateUserArgs) {
  const session = await auth();
  if (session?.user.role !== "superadmin") {
    throw new Error("Unauthorized: Only superadmin can update users");
  }

  const data = updateUserSchema.parse(formData);

  try {
    // 1. Update Firebase Auth (email and display name if changed)
    await admin.auth().updateUser(userId, {
      email: data.email,
      displayName: data.name,
    });

    // 2. Update Firestore document
    const ref = adminDb.collection("users").doc(userId);
    await ref.update({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath("/superadmin/users");
    return { success: true };
  } catch (err) {
    console.error("Error updating user:", err);
    if (err instanceof Error) throw new Error(err.message);
    throw new Error("Gagal memperbarui data user");
  }
}
