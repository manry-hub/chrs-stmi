"use client";

import { useEffect, useState } from "react";
import { subscribeToAllReportsAdmin } from "@/lib/firebase/reports";
import { ReportTable } from "@/components/admin/ReportTable";
import { DateFilterBar } from "@/components/admin/DateFilterBar";
import { ReportFilterBar } from "@/components/admin/ReportFilterBar";
import type { ReportDocument, ReportStatus } from "@/types";
import { Loader2, Plus, PlusCircle } from "lucide-react";
import { DateFilterRange, isWithinDateRange } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SuperadminReportsPage() {
    const [reports, setReports] = useState<ReportDocument[]>([]);
    const [dateFilter, setDateFilter] = useState<DateFilterRange>("hari");
    const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
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
        const matchesDate = isWithinDateRange(r.createdAt as any, dateFilter);
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesDate && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-row justify-between items-start gap-4 mb-2 sm:mb-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manajemen Laporan</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Pantau seluruh laporan bahaya dari semua pengguna secara real-time.</p>
                </div>
                <Link href="/dashboard" className="shrink-0 mt-1 sm:mt-0">
                    <Button size="sm" className="shadow-lg shadow-blue-500/20 text-xs sm:text-sm px-2 sm:px-4 hidden sm:flex">
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Tambah Laporan</span>
                        <span className="sm:hidden">Tambah</span>
                    </Button>
                    <Button size="sm" className="shadow-lg shadow-blue-500/20 text-[10px] px-2 h-8 flex sm:hidden">
                        <Plus className="w-3 h-3 mr-1" />
                        Tambah
                    </Button>
                </Link>
            </div>

            {/* Filter */}
            <div className="flex flex-row justify-end items-center gap-2 sm:gap-4 mb-6 mt-4 sm:mt-0">
                <ReportFilterBar value={statusFilter} onChange={setStatusFilter} />
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
