"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function deleteUser(userId: string) {
  const session = await auth();
  if (session?.user.role !== "superadmin") throw new Error("Unauthorized");
  if (userId === session.user.id) throw new Error("Tidak dapat menghapus akun sendiri");

  await adminDb.collection("users").doc(userId).delete();
  return { success: true };
}
