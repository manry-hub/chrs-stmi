"use server";

import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase/admin";

export async function getUsers() {
    const session = await auth();
    if (session?.user.role !== "superadmin") throw new Error("Unauthorized");

    const snap = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    const users = snap.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            role: data.role ?? "user",
        };
    });
    // JSON round-trip strips any remaining Firestore class instances
    return JSON.parse(JSON.stringify(users));
}
