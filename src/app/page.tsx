import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { EmergencyCallButton } from "@/components/ui/EmergencyCallButton";

export default async function HomePage() {
    const session = await auth();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
            {/* Background Image */}
            <Image src="/background.webp" alt="Kampus Background" fill priority className="object-cover -z-20" quality={90} />

            {/* Overlay for Readability */}
            <div className="absolute inset-0 bg-black/40 -z-10" />

            <div className="text-center max-w-4xl relative z-10">
                <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-white/90 backdrop-blur-sm rounded-2xl mb-6 sm:mb-8 transition-transform hover:scale-105 duration-300 shadow-sm">
                    <Image src="/logostmi.png" width={64} height={64} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" alt="logostmi" />
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-4 sm:mb-6">
                    Kampus Aman,
                    <br className="hidden sm:block" />
                    <span className="text-white sm:text-white"> Tanggung Jawab Bersama.</span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-white font-medium mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2 drop-shadow-sm">
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
                        className="w-full sm:w-auto min-h-[52px] px-8 text-base border-slate-200 text-slate-700 bg-white/90 hover:bg-white shadow-sm"
                    >
                        <Link href={ROUTES.REPORTS}>Lihat Laporan Publik</Link>
                    </Button>
                </div>
                <div className="mt-6 sm:mt-8 flex justify-center">
                    <EmergencyCallButton />
                </div>
            </div>

            <div className="mt-12 sm:mt-20 relative z-10">
                <p className="text-xs sm:text-sm text-white font-bold tracking-widest uppercase bg-white/50 px-4 py-1 rounded-full backdrop-blur-[2px]">
                    MAHASISWA &bull; DOSEN &bull; STAFF
                </p>
            </div>
        </div>
    );
}
