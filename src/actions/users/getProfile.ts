"use server";

import { adminDb } from "@/lib/firebase/admin";
import { auth } from "@/lib/auth";

export async function getProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const doc = await adminDb.collection("users").doc(session.user.id).get();
  if (!doc.exists) return null;

  const data = doc.data();
  return {
    name: data?.name || "",
    phone: data?.phone || "",
    email: data?.email || "",
  };
}
