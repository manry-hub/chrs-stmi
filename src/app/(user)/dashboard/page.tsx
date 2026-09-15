import { ReportSubmitForm } from "@/components/report/ReportSubmitForm";
import { getLocations } from "@/actions/masterData/locations";
import { getHazardTypes } from "@/actions/masterData/hazardTypes";

export const revalidate = 0;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ loc?: string }> }) {
    const { loc } = await searchParams;
    const [locations, hazardTypes] = await Promise.all([getLocations(), getHazardTypes()]);

    const rawEnv = process.env.NEXT_PUBLIC_ENABLE_GEOFENCING;
    const envValue = (rawEnv || "").replace(/['"]/g, "").trim().toLowerCase();
    const isGeofenceEnabled = envValue === "true";
    console.log("DashboardPage GEOFENCE DEBUG:", { rawEnv, envValue, isGeofenceEnabled });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    Lapor Sumber Potensi Bahaya Baru
                </h1>
                <p className="text-sm text-slate-500 mt-1">Gunakan form di bawah untuk melaporkan kondisi berbahaya di sekitar kampus.</p>
            </div>

            <div className="max-w-3xl">
                <ReportSubmitForm locations={locations} hazardTypes={hazardTypes} initialLocationId={loc} isGeofenceEnabled={isGeofenceEnabled} />
            </div>
        </div>
    );
}
