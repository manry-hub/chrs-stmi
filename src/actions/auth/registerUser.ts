"use server";

import { adminDb } from "@/lib/firebase/admin";
import { registerSchema } from "@/lib/validations/auth";
import { FieldValue } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

export async function registerUser(formData: unknown) {
  const data = registerSchema.parse(formData);

  // Check if email already exists
  const existing = await adminDb.collection("users").where("email", "==", data.email).limit(1).get();

  if (!existing.empty) throw new Error("Email sudah terdaftar");

  // Create user in Firebase Auth using Admin SDK so they can actually login
  // Note: the workflow specifies directly setting the document, but since authentication
  // relies on Identity Toolkit REST (signInWithPassword), the user must exist in Firebase Auth too.
  try {
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });

    // Create user document
    const ref = adminDb.collection("users").doc(userRecord.uid);
    await ref.set({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: "user",
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("Registration failed");
  }
}
