import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";
import { EmergencyCallButton } from "@/components/ui/EmergencyCallButton";

export default async function HomePage() {
    const session = await auth();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center py-10 sm:py-12 px-4 sm:px-6 md:px-8 overflow-hidden">
            {/* Background Image */}
            <Image src="/background.webp" alt="Kampus Background" fill priority className="object-cover -z-20" quality={90} />

            {/* Overlay for Readability */}
            <div className="absolute inset-0 bg-black/50 -z-10" />

            <div className="text-center w-full max-w-5xl relative z-10 px-2 sm:px-4">
                <div className="inline-flex items-center justify-center p-3 sm:p-4 md:p-5 bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl mb-6 sm:mb-8 md:mb-10 transition-transform hover:scale-105 duration-300 shadow-sm">
                    <Image src="/logostmi.png" width={80} height={80} className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain" alt="logostmi" />
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.2] sm:leading-[1.15] mb-4 sm:mb-6 md:mb-8">
                    Kampus Aman,
                    <br className="hidden sm:block" />
                    <span className="text-white"> Tanggung Jawab Bersama.</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-medium mb-8 sm:mb-10 md:mb-12 max-w-[95%] sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed sm:leading-relaxed px-2 md:px-0 drop-shadow-sm">
                    Sistem pelaporan kondisi bahaya secara real-time untuk Civitas Akademika. Laporkan segera potensi kerusakan agar lingkungan kampus
                    tetap aman dan nyaman.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 w-full max-w-[280px] sm:max-w-none mx-auto">
                    {session ? (
                        <Button asChild size="lg" className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] md:min-h-[56px] px-6 sm:px-8 md:px-10 text-sm sm:text-base md:text-lg shadow-lg shadow-blue-500/25 rounded-xl">
                            <Link href={ROUTES.DASHBOARD}>Lapor Sekarang</Link>
                        </Button>
                    ) : (
                        <Button asChild size="lg" className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] md:min-h-[56px] px-6 sm:px-8 md:px-10 text-sm sm:text-base md:text-lg shadow-lg shadow-blue-500/25 rounded-xl">
                            <Link href={ROUTES.LOGIN}>Lapor Sekarang</Link>
                        </Button>
                    )}
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] md:min-h-[56px] px-6 sm:px-8 md:px-10 text-sm sm:text-base md:text-lg border-white/20 text-slate-800 bg-white/95 hover:bg-white hover:text-slate-900 shadow-sm rounded-xl transition-all"
                    >
                        <Link href={ROUTES.REPORTS}>Lihat Laporan Publik</Link>
                    </Button>
                </div>
                
                <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center">
                    <EmergencyCallButton />
                </div>
            </div>
        </div>
    );
}
