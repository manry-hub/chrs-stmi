"use client";

import { useEffect, useState } from "react";
import { subscribeToAllReportsAdmin } from "@/lib/firebase/reports";
import { ReportTable } from "@/components/admin/ReportTable";
import { ReportFilterBar } from "@/components/admin/ReportFilterBar";
import type { ReportDocument, ReportStatus } from "@/types";
import { Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function AdminDashboard() {
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

  const filtered =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  // Stats
  const totalReports = reports.length;
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const confirmedCount = reports.filter((r) => r.status === "confirmed").length;
  const doneCount = reports.filter((r) => r.status === "done").length;

  const pieData = [
    { name: "Pending", value: pendingCount, color: "#d97706" }, // amber-600
    { name: "Dikonfirmasi", value: confirmedCount, color: "#16a34a" }, // green-600
    { name: "Selesai", value: doneCount, color: "#9333ea" }, // purple-600
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Laporan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola dan pantau laporan bahaya secara real-time.
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalReports}</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm flex-1">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm flex-1">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Dikonfirmasi</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{confirmedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm flex-1">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Selesai</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{doneCount}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Proporsi Status Laporan</h3>
          {totalReports > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-64 flex items-center justify-center text-slate-400 text-sm">
              Belum ada data untuk ditampilkan
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <ReportFilterBar value={filter} onChange={setFilter} />

      {/* Report Table or Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <ReportTable reports={filtered} />
      )}
    </div>
  );
}
