import Link from "next/link";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/Button";
import { ShieldAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { EmergencyCallButton } from "@/components/ui/EmergencyCallButton";
export default async function HomePage() {
    const session = await auth();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center -mt-10 px-4">
            <div className="text-center max-w-3xl">
                <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-8">
                    <img src="logostmi.png" width="60px" alt="logostmi" />
                </div>

                <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                    Kampus Aman,
                    <br />
                    Tanggung Jawab Bersama.
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Sistem pelaporan kondisi bahaya (hazard) real-time untuk Civitas Akademika. Laporkan segera potensi kerusakan agar lingkungan
                    kampus tetap aman dan nyaman.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {session ? (
                        <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-base shadow-lg shadow-blue-500/25">
                            <Link href={ROUTES.DASHBOARD}>Lapor</Link>
                        </Button>
                    ) : (
                        <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-base shadow-lg shadow-blue-500/25">
                            <Link href={ROUTES.LOGIN}>Lapor</Link>
                        </Button>
                    )}
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto h-14 px-8 text-base border-slate-300 text-slate-700 bg-white shadow-sm"
                    >
                        <Link href={ROUTES.REPORTS}>Lihat Laporan Publik</Link>
                    </Button>
                    <EmergencyCallButton />
                </div>
            </div>

            <div className="mt-20">
                <p className="text-sm text-slate-400 font-medium tracking-wide">MAHASISWA &bull; DOSEN &bull; STAFF</p>
            </div>
        </div>
    );
}
