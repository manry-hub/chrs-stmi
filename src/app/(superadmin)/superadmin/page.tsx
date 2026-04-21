import { getAnalytics } from "@/actions/analytics/getAnalytics";
import { StatsCard } from "@/components/superadmin/StatsCard";
import { FileCheck, AlertTriangle } from "lucide-react";
import { SuperadminCharts } from "@/components/superadmin/SuperadminCharts";

export default async function SuperadminDashboard() {
  const { total, pending, confirmed, avgResponseMinutes, topSources } = await getAnalytics();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics Sistem</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ringkasan performa dan statistik keseluruhan sistem pelaporan.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Laporan" value={total} color="blue" />
        <StatsCard label="Belum Dikonfirmasi" value={pending} color="yellow" />
        <StatsCard label="Dikonfirmasi" value={confirmed} color="green" />
        <StatsCard
          label="Rata-rata Respons"
          value={
            avgResponseMinutes !== null
              ? `${avgResponseMinutes.toFixed(1)} menit`
              : "N/A"
          }
          color="purple"
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Response Rate Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Tingkat Penyelesaian</h3>
              <p className="text-xs text-slate-500">Persentase laporan yang sudah dikonfirmasi</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-emerald-600">
              {total > 0 ? ((confirmed / total) * 100).toFixed(1) : "0"}%
            </span>
            <span className="text-sm text-slate-500 mb-1">
              ({confirmed} dari {total})
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (confirmed / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Pending Alert Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Laporan Menunggu</h3>
              <p className="text-xs text-slate-500">Laporan yang belum ditindaklanjuti</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-amber-600">{pending}</span>
            <span className="text-sm text-slate-500 mb-1">laporan</span>
          </div>
          {pending > 0 && (
            <p className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              ⚠️ Ada {pending} laporan yang membutuhkan perhatian segera.
            </p>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <SuperadminCharts total={total} pending={pending} confirmed={confirmed} topSources={topSources} />
    </div>
  );
}
