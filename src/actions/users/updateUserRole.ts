"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";
import { z } from "zod";

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["user", "admin", "superadmin"]),
});

export async function updateUserRole(input: unknown) {
  const session = await auth();
  if (session?.user.role !== "superadmin") throw new Error("Unauthorized");

  const { userId, role } = updateRoleSchema.parse(input);

  // Prevent superadmin from demoting themselves
  if (userId === session.user.id) throw new Error("Tidak dapat mengubah role sendiri");

  await adminDb.collection("users").doc(userId).update({ role });
  return { success: true };
}
