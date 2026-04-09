import Link from "next/link";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { EmergencyCallButton } from "@/components/ui/EmergencyCallButton";
export default async function HomePage() {
    const session = await auth();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
            <div className="text-center max-w-4xl">
                <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-blue-100/80 rounded-2xl mb-6 sm:mb-8 transition-transform hover:scale-105 duration-300">
                    <img src="logostmi.png" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" alt="logostmi" />
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4 sm:mb-6">
                    Kampus Aman,
                    <br className="hidden sm:block" />
                    <span className="text-blue-600 sm:text-slate-900"> Tanggung Jawab Bersama.</span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
                    Sistem pelaporan kondisi bahaya (hazard) real-time untuk Civitas Akademika. Laporkan segera potensi kerusakan agar lingkungan
                    kampus tetap aman dan nyaman.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none mx-auto">
                    {session ? (
                        <Button asChild size="lg" className="w-full sm:w-auto min-h-[52px] px-8 text-base shadow-lg shadow-blue-500/25">
                            <Link href={ROUTES.DASHBOARD}>Lapor Sekarang</Link>
                        </Button>
                    ) : (
                        <Button asChild size="lg" className="w-full sm:w-auto min-h-[52px] px-8 text-base shadow-lg shadow-blue-500/25">
                            <Link href={ROUTES.LOGIN}>Lapor Sekarang</Link>
                        </Button>
                    )}
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto min-h-[52px] px-8 text-base border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
                    >
                        <Link href={ROUTES.REPORTS}>Lihat Laporan Publik</Link>
                    </Button>
                </div>
                <div className="mt-6 sm:mt-8 flex justify-center">
                    <EmergencyCallButton />
                </div>
            </div>

            <div className="mt-12 sm:mt-20">
                <p className="text-xs sm:text-sm text-slate-400 font-semibold tracking-widest uppercase">
                    MAHASISWA &bull; DOSEN &bull; STAFF
                </p>
            </div>
        </div>
    );
}
