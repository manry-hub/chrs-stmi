import { getHazardTypes } from "@/actions/masterData/hazardTypes";
import { HazardTypeClient } from "@/components/superadmin/HazardTypeClient";
import Link from "next/link";

export const revalidate = 0;

export default async function HazardTypesPage() {
    const hazardTypes = await getHazardTypes();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
               
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manajemen Kategori Bahaya</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Kelola jenis-jenis sumber potensi bahaya yang dapat dipilih oleh pelapor.</p>
                </div>
            </div>

            <HazardTypeClient initialData={hazardTypes} />
        </div>
    );
}
