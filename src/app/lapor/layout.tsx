import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { PushNotificationToggle } from "@/components/notifications/PushNotificationToggle";

/**
 * Layout publik untuk pelaporan. Sengaja tidak memakai AppShell: halaman ini
 * terbuka tanpa login sehingga tidak ada sidebar, badge role, atau tombol
 * logout yang relevan.
 */
export default function LaporLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-slate-900 text-white sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
                    <Link href={ROUTES.HOME} className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            <Image src="/logostmi.png" alt="Logo STMI" width={36} height={36} className="object-cover" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-bold tracking-wide truncate">HazardReport</span>
                            <span className="block text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                                civitas akademika
                            </span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href={ROUTES.REPORTS}
                            className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                        >
                            Laporan lainnya
                        </Link>
                        <PushNotificationToggle />
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <Suspense>{children}</Suspense>
            </main>

            <ToastProvider />
        </div>
    );
}
