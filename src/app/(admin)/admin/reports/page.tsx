"use client";

import { useEffect, useState } from "react";
import { subscribeToAllReportsAdmin } from "@/lib/firebase/reports";
import { ReportTable } from "@/components/admin/ReportTable";
import { DateFilterBar } from "@/components/admin/DateFilterBar";
import { ReportFilterBar } from "@/components/admin/ReportFilterBar";
import type { ReportDocument, ReportStatus } from "@/types";
import { Loader2, Plus } from "lucide-react";
import { DateFilterRange, isWithinDateRange } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";

export default function AdminReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilterRange>("hari");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"all" | "my-locations">("my-locations");
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

  const baseReports = reports.filter((r) => {
    const isMyLoc = viewMode === "all" || (r.assignedAdminId === session?.user?.id);
    const matchesDate = isWithinDateRange(r.createdAt as any, dateFilter);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return isMyLoc && matchesDate && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 flex flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">Manajemen Laporan</h1>
          <p className="text-[10px] sm:text-sm text-slate-500 mt-0.5 sm:mt-1 leading-snug">
            Daftar seluruh laporan bahaya yang masuk secara real-time.
          </p>
        </div>
        <Link href="/dashboard" className="shrink-0 mt-0.5 sm:mt-0">
          <Button className="shadow-md sm:shadow-lg shadow-blue-500/20 text-[10px] sm:text-sm h-7 sm:h-10 px-2 sm:px-4 py-0 sm:py-2">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Tambah Laporan
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0">
          <div className="shrink-0">
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                    onClick={() => setViewMode("my-locations")}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-medium rounded-md transition-colors ${viewMode === "my-locations" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Lokasi Saya
                </button>
                <button
                    onClick={() => setViewMode("all")}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-medium rounded-md transition-colors ${viewMode === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Semua Lokasi
                </button>
            </div>
          </div>
          
          <div className="flex justify-end shrink-0">
            <DateFilterBar value={dateFilter} onChange={setDateFilter} />
          </div>
        </div>

        <div className="flex overflow-x-auto pb-1 sm:pb-0 w-full">
          <ReportFilterBar value={statusFilter} onChange={setStatusFilter} />
        </div>
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
        </div>
      ) : (
        <ReportTable reports={baseReports} />
      )}
    </div>
  );
}
