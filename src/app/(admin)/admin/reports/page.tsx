"use client";

import { useEffect, useState } from "react";
import { subscribeToAllReportsAdmin } from "@/lib/firebase/reports";
import { ReportTable } from "@/components/admin/ReportTable";
import { DateFilterBar } from "@/components/admin/DateFilterBar";
import type { ReportDocument } from "@/types";
import { Loader2, Plus } from "lucide-react";
import { DateFilterRange, isWithinDateRange } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";

export default function AdminReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilterRange>("hari");
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

  const baseReports = viewMode === "my-locations" && session?.user?.id
    ? reports.filter(r => r.assignedAdminId === session.user.id && isWithinDateRange(r.createdAt as any, dateFilter))
    : reports.filter(r => isWithinDateRange(r.createdAt as any, dateFilter));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Laporan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar seluruh laporan bahaya yang masuk secara real-time.
          </p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
            <button
                onClick={() => setViewMode("my-locations")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === "my-locations" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Lokasi Saya
            </button>
            <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Semua Lokasi
            </button>
        </div>
      </div>

      {/* Filter & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link href="/dashboard">
          <Button className="shadow-lg shadow-blue-500/20 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Laporan
          </Button>
        </Link>
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
        </div>
      ) : (
        <ReportTable reports={baseReports} />
      )}
    </div>
  );
}
