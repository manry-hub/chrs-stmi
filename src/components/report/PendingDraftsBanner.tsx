"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCcw, AlertTriangle } from "lucide-react";
import { getDrafts, OfflineDraft } from "@/lib/offlineSync";

/**
 * Menampilkan draft laporan yang masih mengantre di perangkat ini.
 *
 * Sebelumnya draft hanya terlihat di halaman riwayat laporan milik akun.
 * Karena pelaporan kini publik, banner ini yang memberi tahu pelapor bahwa
 * laporannya tersimpan dan menunggu sinyal.
 */
export function PendingDraftsBanner() {
    const [drafts, setDrafts] = useState<OfflineDraft[]>([]);

    useEffect(() => {
        let active = true;

        const load = async () => {
            const local = await getDrafts();
            if (active) setDrafts(local);
        };

        load();
        // Poll agar banner ikut hilang begitu draft berhasil tersinkronisasi.
        const intervalId = setInterval(load, 5000);
        window.addEventListener("online", load);

        return () => {
            active = false;
            clearInterval(intervalId);
            window.removeEventListener("online", load);
        };
    }, []);

    if (drafts.length === 0) return null;

    const failed = drafts.filter((d) => d.status === "FAILED").length;

    return (
        <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
                {failed > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                    <WifiOff className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                )}

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                        {drafts.length} laporan tersimpan di perangkat ini
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                        {failed > 0
                            ? "Sebagian laporan gagal terkirim dan akan dicoba ulang otomatis saat koneksi membaik."
                            : "Laporan akan terkirim otomatis begitu perangkat terhubung ke internet. Jangan tutup aplikasi ini."}
                    </p>

                    <ul className="mt-3 space-y-1.5">
                        {drafts.map((draft) => (
                            <li key={draft.id} className="flex items-center gap-2 text-xs text-slate-700">
                                {draft.status === "SYNCING" && <RefreshCcw className="w-3 h-3 animate-spin shrink-0 text-blue-600" />}
                                {draft.status === "PENDING" && <WifiOff className="w-3 h-3 shrink-0 text-orange-600" />}
                                {draft.status === "FAILED" && <AlertTriangle className="w-3 h-3 shrink-0 text-red-600" />}

                                <span className="truncate">{draft.formData.description || "Laporan"}</span>
                                <span className="text-slate-400 shrink-0">·</span>
                                <span className="text-slate-500 shrink-0">
                                    {draft.status === "SYNCING"
                                        ? "Mengirim..."
                                        : draft.status === "FAILED"
                                        ? "Gagal, akan dicoba lagi"
                                        : "Menunggu sinyal"}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
