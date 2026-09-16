import { ReportSubmitForm } from "@/components/report/ReportSubmitForm";
import { getLocations } from "@/actions/masterData/locations";
import { getHazardTypes } from "@/actions/masterData/hazardTypes";
import { PendingDraftsBanner } from "@/components/report/PendingDraftsBanner";
import { LocationGate } from "@/components/report/LocationGate";

export const revalidate = 0;

export const metadata = {
    title: "Lapor Bahaya | HazardReport",
};

export default async function LaporPage({ searchParams }: { searchParams: Promise<{ loc?: string }> }) {
    const { loc } = await searchParams;
    const [locations, hazardTypes] = await Promise.all([getLocations(), getHazardTypes()]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Lapor Sumber Potensi Bahaya</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Tidak perlu akun. Pelaporan hanya dapat dilakukan dari dalam kawasan kampus.
                </p>
            </div>

            {/* Di luar gerbang: draft yang tertunda tetap harus terlihat pemiliknya
                walau saat ini lokasinya belum terverifikasi. */}
            <PendingDraftsBanner />

            <LocationGate>
                <ReportSubmitForm locations={locations} hazardTypes={hazardTypes} initialLocationId={loc} />
            </LocationGate>
        </div>
    );
}
