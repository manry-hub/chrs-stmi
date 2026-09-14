import { getAnalytics } from "@/actions/analytics/getAnalytics";
import { getAdminPerformance, getLocationPerformance } from "@/actions/admin/performance";
import { AlertTriangle, CheckCircle, Clock, ClipboardList } from "lucide-react";
import { SuperadminCharts } from "@/components/superadmin/SuperadminCharts";
import { DashboardDateFilter } from "@/components/superadmin/DashboardDateFilter";
import { AdminPerformanceTable } from "@/components/superadmin/AdminPerformanceTable";
import { LocationPerformanceTable } from "@/components/superadmin/LocationPerformanceTable";
import { DateFilterRange } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function SuperadminDashboard({ searchParams }: PageProps) {
  const { date } = await searchParams;
  const dateFilter = (date as DateFilterRange) || "hari";

  const [{ total, pending, confirmed, done, avgResponseMinutes, topSources, pendingList }, performances, locationPerformances] = await Promise.all([
    getAnalytics(dateFilter),
    getAdminPerformance(dateFilter),
    getLocationPerformance(dateFilter)
  ]);

  // Calculate totals for admin performance
  const totalAssigned = performances.reduce((acc, curr) => acc + curr.totalAssigned, 0);
  const totalDone = performances.reduce((acc, curr) => acc + curr.totalDone, 0);
  const avgCompletion = totalAssigned > 0 ? Math.round((totalDone / totalAssigned) * 100) : 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Dashboard Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ringkasan statistik keseluruhan sistem pelaporan dan performa cleaning service.
          </p>
        </div>
        <DashboardDateFilter />
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Laporan */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-2 mb-2 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Total Laporan</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{total}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Menunggu (PENDING -> RED) */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-2 mb-2 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Menunggu</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-red-500">{pending}</h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>
          </div>
        </div>

        {/* Tingkat Penyelesaian (CONFIRMED -> YELLOW) */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-2 mb-2 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Penyelesaian</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-green-600">
                {total > 0 ? ((done / total) * 100).toFixed(1) : "0"}%
              </h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
          </div>
        </div>
       
        {/* Waktu Respons */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-2 mb-2 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Respons per laporan</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-purple-600">
                {avgResponseMinutes !== null ? avgResponseMinutes.toFixed(1) : "-"} min
              </h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <SuperadminCharts total={total} pendingList={pendingList} topSources={topSources} />

      {/* Admin Performance Section */}
      <AdminPerformanceTable performances={performances} />

      {/* Location Performance Section */}
      <LocationPerformanceTable locationPerformances={locationPerformances} />

    </div>
  );
}
