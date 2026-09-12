"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createLocation(data: { id: string; name: string; adminId: string | null; adminName: string | null }) {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const id = data.id.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
        await adminDb.collection("locations").doc(id).set({
            name: data.name,
            adminId: data.adminId,
            adminName: data.adminName,
            createdAt: FieldValue.serverTimestamp(),
        });

        revalidatePath("/superadmin/locations");
        revalidatePath("/reports/new");
        return { success: true };
    } catch (error) {
        console.error("Error creating location:", error);
        return { success: false, error: "Gagal membuat lokasi" };
    }
}

export async function updateLocation(id: string, data: { name: string; adminId: string | null; adminName: string | null }) {
    const session = await auth();
    if (session?.user?.role !== "superadmin") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await adminDb.collection("locations").doc(id).update({
            name: data.name,
            adminId: data.adminId,
            adminName: data.adminName,
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

import { LocationDocument } from "@/types";

export async function getLocations(): Promise<LocationDocument[]> {
    try {
        const snapshot = await adminDb.collection("locations").orderBy("createdAt", "asc").get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
            } as unknown as LocationDocument;
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        return [];
    }
}
