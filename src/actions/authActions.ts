"use server";

import { adminAuth, adminDb } from "@/lib/firebase/adminApp";
import { RegisterInput, registerSchema } from "@/lib/validations/auth";
import { USER_ROLES } from "@/constants";
import * as admin from "firebase-admin";

export async function registerUser(input: RegisterInput) {
  try {
    const validatedData = registerSchema.parse(input);

    const userRecord = await adminAuth.createUser({
      email: validatedData.email,
      password: validatedData.password,
      displayName: validatedData.name,
    });

    await adminDb.collection("users").doc(userRecord.uid).set({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      role: USER_ROLES.USER,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error registering user", error);
    return { success: false, error: error.message || "Registration failed" };
  }
}
