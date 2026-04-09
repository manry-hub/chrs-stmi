"use server";

import { adminDb } from "@/lib/firebase/admin";
import { createUserSchema } from "@/lib/validations/user";
import { FieldValue } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createUser(formData: unknown) {
  const session = await auth();
  if (session?.user.role !== "superadmin") {
    throw new Error("Unauthorized: Only superadmin can create users");
  }

  const data = createUserSchema.parse(formData);

  // Check if email already exists in Firestore specifically
  const existing = await adminDb.collection("users").where("email", "==", data.email).limit(1).get();
  if (!existing.empty) throw new Error("Email sudah terdaftar");

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });

    // Create user document in Firestore
    const ref = adminDb.collection("users").doc(userRecord.uid);
    await ref.set({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      createdAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/superadmin/users");
    return { success: true, userId: userRecord.uid };
  } catch (err) {
    console.error("Error creating user:", err);
    if (err instanceof Error) throw new Error(err.message);
    throw new Error("Gagal membuat user baru");
  }
}
