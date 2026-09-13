"use client";

import { useEffect, useState } from "react";
import { subscribeToAllReportsAdmin } from "@/lib/firebase/reports";
import { ReportTable } from "@/components/admin/ReportTable";
import { DateFilterBar } from "@/components/admin/DateFilterBar";
import type { ReportDocument } from "@/types";
import { Loader2, Plus, PlusCircle } from "lucide-react";
import { DateFilterRange, isWithinDateRange } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SuperadminReportsPage() {
    const [reports, setReports] = useState<ReportDocument[]>([]);
    const [dateFilter, setDateFilter] = useState<DateFilterRange>("hari");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsub = subscribeToAllReportsAdmin(
            (data) => {
                setReports(data);
                setLoading(false);
            },
            (err) => {
                console.error("Firestore Error:", err);
                setError(err.message);
                setLoading(false);
            }
        );
        return unsub;
    }, []);

    const filtered = reports.filter((r) => {
        return isWithinDateRange(r.createdAt as any, dateFilter);
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen Laporan</h1>
                    <p className="text-sm text-slate-500 mt-1">Pantau seluruh laporan bahaya dari semua pengguna secara real-time.</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                
                <Button className="shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Laporan
                </Button>
                <DateFilterBar value={dateFilter} onChange={setDateFilter} />
            </div>

            {/* Report Table or Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    <p className="font-semibold mb-1">Gagal memuat laporan:</p>
                    <p className="text-sm">{error}</p>
                    <p className="text-xs mt-2 italic">
                        Jika ini error index, klik link pada console browser (F12) untuk membuatnya.
                    </p>
                </div>
            ) : (
                <ReportTable reports={filtered} baseUrl="/admin/reports" allowDelete={true} />
            )}
        </div>
    );
}
