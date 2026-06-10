"use client";

import { useEffect, useState } from "react";
import { subscribeToAllReportsAdmin } from "@/lib/firebase/reports";
import { ReportTable } from "@/components/admin/ReportTable";
import { ReportFilterBar } from "@/components/admin/ReportFilterBar";
import type { ReportDocument, ReportStatus } from "@/types";
import { Loader2 } from "lucide-react";

export default function SuperadminReportsPage() {
    const [reports, setReports] = useState<ReportDocument[]>([]);
    const [filter, setFilter] = useState<ReportStatus | "all">("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeToAllReportsAdmin((data) => {
            setReports(data);
            setLoading(false);
        });
        return unsub;
    }, []);

    const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Manajemen Laporan</h1>
                <p className="text-sm text-slate-500 mt-1">Pantau seluruh laporan bahaya dari semua pengguna secara real-time.</p>
            </div>

            {/* Filter */}
            <ReportFilterBar value={filter} onChange={setFilter} />

            {/* Report Table or Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : (
                <ReportTable reports={filtered} baseUrl="/admin/reports" allowDelete={true} />
            )}
        </div>
    );
}
