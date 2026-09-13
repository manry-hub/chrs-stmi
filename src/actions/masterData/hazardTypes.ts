"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createHazardType(data: { name: string }) {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const docRef = adminDb.collection("hazardTypes").doc();
        await docRef.set({
            name: data.name,
            createdAt: FieldValue.serverTimestamp(),
        });

        revalidatePath("/superadmin/hazard-types");
        revalidatePath("/reports/new");
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating hazard type:", error);
        return { success: false, error: "Gagal membuat jenis bahaya" };
    }
}

export async function deleteHazardType(id: string) {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await adminDb.collection("hazardTypes").doc(id).delete();

        revalidatePath("/superadmin/hazard-types");
        revalidatePath("/reports/new");
        return { success: true };
    } catch (error) {
        console.error("Error deleting hazard type:", error);
        return { success: false, error: "Gagal menghapus jenis bahaya" };
    }
}

export async function updateHazardType(id: string, data: { name: string }) {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await adminDb.collection("hazardTypes").doc(id).update({
            name: data.name,
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath("/superadmin/hazard-types");
        revalidatePath("/reports/new");
        return { success: true };
    } catch (error) {
        console.error("Error updating hazard type:", error);
        return { success: false, error: "Gagal mengupdate jenis bahaya" };
    }
}

import { HazardTypeDocument } from "@/types";

export async function getHazardTypes(): Promise<HazardTypeDocument[]> {
    try {
        const snapshot = await adminDb.collection("hazardTypes").orderBy("createdAt", "asc").get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
            } as unknown as HazardTypeDocument;
        });
    } catch (error) {
        console.error("Error fetching hazard types:", error);
        return [];
    }
}
