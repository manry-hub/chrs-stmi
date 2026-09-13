"use client";

import { useEffect, useState } from "react";
import { subscribeToAllReportsAdmin } from "@/lib/firebase/reports";
import type { ReportDocument } from "@/types";
import { DateFilterRange, isWithinDateRange } from "@/lib/utils";
import { DateFilterBar } from "@/components/admin/DateFilterBar";
import { PendingReportCard } from "@/components/admin/PendingReportCard";
import { useSession } from "next-auth/react";
import { Sparkles, ClipboardList, AlertTriangle, CheckCircle, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilterRange>("hari");
  const [viewMode, setViewMode] = useState<"all" | "my-locations">("my-locations");

  useEffect(() => {
    const unsub = subscribeToAllReportsAdmin(
      (data) => {
        setReports(data);
      },
      (err) => {
        console.error("Firestore Error:", err);
      }
    );
    return unsub;
  }, []);

  const baseReports = viewMode === "my-locations" && session?.user?.id
    ? reports.filter(r => r.assignedAdminId === session.user.id && isWithinDateRange(r.createdAt as any, dateFilter))
    : reports.filter(r => isWithinDateRange(r.createdAt as any, dateFilter));

  // Stats
  const totalReports = baseReports.length;
  const pendingReports = baseReports.filter((r) => r.status === "pending");
  const pendingCount = pendingReports.length;
  const confirmedCount = baseReports.filter((r) => r.status === "confirmed").length;
  const doneCount = baseReports.filter((r) => r.status === "done").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Tugas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau dan tindak lanjuti laporan bahaya yang membutuhkan perhatian segera.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
            <button
                onClick={() => setViewMode("my-locations")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === "my-locations" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Tugas Saya
            </button>
            <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Semua Tugas
            </button>
        </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-end mb-4">
        <DateFilterBar value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Laporan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Laporan</p>
              <h3 className="text-3xl font-bold text-slate-900">{totalReports}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Menunggu (PENDING -> RED) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Laporan Menunggu</p>
              <h3 className="text-3xl font-bold text-red-500">{pendingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>

        {/* Dikonfirmasi (CONFIRMED -> YELLOW) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Dikonfirmasi</p>
              <h3 className="text-3xl font-bold text-yellow-600">{confirmedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Selesai (DONE -> GREEN) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Selesai</p>
              <h3 className="text-3xl font-bold text-green-600">{doneCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reports Section */}
      <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Laporan Menunggu Tindakan ({pendingCount})</h2>
          </div>

          {pendingReports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {pendingReports.map(report => (
                      <PendingReportCard key={report.id} report={report} />
                  ))}
              </div>
          ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Kerja Bagus!</h3>
                  <p className="text-slate-500 max-w-sm">
                      Saat ini tidak ada laporan baru yang menunggu konfirmasi di wilayah tanggung jawab Anda.
                  </p>
              </div>
          )}
      </div>
    </div>
  );
}
