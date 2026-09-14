"use client";

import { useUserReports } from "@/hooks/useUserReports";
import { ReportCard } from "./ReportCard";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getDrafts, OfflineDraft } from "@/lib/offlineSync";

export function UserReportList({ userId }: { userId: string }) {
    const { reports, loading, error } = useUserReports(userId);
    const [drafts, setDrafts] = useState<OfflineDraft[]>([]);

    const loadDrafts = async () => {
        const localDrafts = await getDrafts();
        setDrafts(localDrafts);
    };

    useEffect(() => {
        loadDrafts();
        
        // Listen to online events to refresh drafts (they might have synced and disappeared)
        window.addEventListener("online", loadDrafts);
        const intervalId = setInterval(loadDrafts, 5000); // Poll every 5s to reflect syncing changes

        return () => {
            window.removeEventListener("online", loadDrafts);
            clearInterval(intervalId);
        };
    }, []);

    if (loading && drafts.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error && drafts.length === 0) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <p className="font-semibold mb-1">Terjadi kesalahan saat memuat laporan:</p>
                <p className="opacity-80">{error}</p>
                <p className="mt-2 text-xs italic">
                    Bila ini kesalahan pertama, kemungkinan database sedang melakukan pembaharuan indeks. Silakan coba lagi dalam beberapa menit.
                </p>
            </div>
        );
    }

    if (reports.length === 0 && drafts.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-100 shadow-sm">
                <p className="text-slate-500">Anda belum pernah membuat laporan sumber potensi bahaya.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Render Drafts first */}
            {drafts.map((draft) => (
                <ReportCard key={draft.id} offlineDraft={draft} />
            ))}
            
            {/* Then Server Reports */}
            {reports.map((report) => (
                <ReportCard key={report.id} report={report} />
            ))}
        </div>
    );
}
