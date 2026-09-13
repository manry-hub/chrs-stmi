"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { LocationDocument } from "@/types";

export async function createLocation(data: { name: string; adminIds: string[]; adminNames: string[] }) {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Auto-generate ID via Firestore
        const docRef = adminDb.collection("locations").doc();
        await docRef.set({
            name: data.name,
            adminIds: data.adminIds,
            adminNames: data.adminNames,
            createdAt: FieldValue.serverTimestamp(),
        });

        revalidatePath("/superadmin/locations");
        revalidatePath("/reports/new");
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating location:", error);
        return { success: false, error: "Gagal membuat lokasi" };
    }
}

export async function updateLocation(id: string, data: { name: string; adminIds: string[]; adminNames: string[] }) {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await adminDb.collection("locations").doc(id).update({
            name: data.name,
            adminIds: data.adminIds,
            adminNames: data.adminNames,
        });

        revalidatePath("/superadmin/locations");
        revalidatePath("/reports/new");
        return { success: true };
    } catch (error) {
        console.error("Error updating location:", error);
        return { success: false, error: "Gagal mengupdate lokasi" };
    }
}

export async function deleteLocation(id: string) {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await adminDb.collection("locations").doc(id).delete();

        revalidatePath("/superadmin/locations");
        revalidatePath("/reports/new");
        return { success: true };
    } catch (error) {
        console.error("Error deleting location:", error);
        return { success: false, error: "Gagal menghapus lokasi" };
    }
}

export async function getLocations(): Promise<LocationDocument[]> {
    try {
        const snapshot = await adminDb.collection("locations").orderBy("createdAt", "asc").get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                // Support both old (single admin) and new (multi admin) format
                adminIds: data.adminIds || (data.adminId ? [data.adminId] : []),
                adminNames: data.adminNames || (data.adminName ? [data.adminName] : []),
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            } as unknown as LocationDocument;
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        return [];
    }
}
