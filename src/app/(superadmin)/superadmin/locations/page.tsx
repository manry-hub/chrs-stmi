import { getLocations } from "@/actions/masterData/locations";
import { LocationClient } from "@/components/superadmin/LocationClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { UserDocument } from "@/types";

export const revalidate = 0;

async function getAdmins() {
    try {
        const snapshot = await adminDb.collection("users").where("role", "==", "admin").get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
            } as unknown as UserDocument;
        });
    } catch (error) {
        console.error("Error fetching admins:", error);
        return [];
    }
}

export default async function LocationsPage() {
    const [locations, admins] = await Promise.all([getLocations(), getAdmins()]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
              
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manajemen Lokasi & Admin</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Kelola daftar lokasi, tugaskan admin penanggung jawab, dan buat QR Code.</p>
                </div>
            </div>

            <LocationClient initialData={locations} admins={admins} />
        </div>
    );
}
