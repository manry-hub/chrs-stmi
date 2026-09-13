import { getAnalytics } from "@/actions/analytics/getAnalytics";
import { getAdminPerformance } from "@/actions/admin/performance";
import { FileText, AlertTriangle, CheckCircle, Clock, ClipboardList } from "lucide-react";
import { SuperadminCharts } from "@/components/superadmin/SuperadminCharts";
import { DashboardDateFilter } from "@/components/superadmin/DashboardDateFilter";
import { DateFilterRange } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function SuperadminDashboard({ searchParams }: PageProps) {
  const { date } = await searchParams;
  const dateFilter = (date as DateFilterRange) || "hari";

  const [{ total, pending, confirmed, done, avgResponseMinutes, topSources, pendingList }, performances] = await Promise.all([
    getAnalytics(dateFilter),
    getAdminPerformance(dateFilter)
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan statistik keseluruhan sistem pelaporan dan performa cleaning service.
          </p>
        </div>
        <DashboardDateFilter />
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Laporan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Laporan</p>
              <h3 className="text-3xl font-bold text-slate-900">{total}</h3>
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
              <h3 className="text-3xl font-bold text-red-500">{pending}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
         
        </div>

        {/* Tingkat Penyelesaian (CONFIRMED -> YELLOW) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Penyelesaian</p>
              <h3 className="text-3xl font-bold text-yellow-600">
                {total > 0 ? ((done / total) * 100).toFixed(1) : "0"}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        
        </div>

       
        {/* Waktu Respons */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Rata-rata Respons per laporan</p>
              <h3 className="text-3xl font-bold text-purple-600">
                {avgResponseMinutes !== null ? avgResponseMinutes.toFixed(1) : "-"} menit
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          
        </div>
      </div>

      {/* Charts Section */}
      <SuperadminCharts total={total} pendingList={pendingList} topSources={topSources} />

      {/* Admin Performance Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Unified Header & Summary */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
                <h2 className="text-lg font-bold text-slate-900">Kinerja Cleaning Service</h2>
                <p className="text-sm text-slate-500 mt-1">Pantau performa penyelesaian laporan oleh masing-masing personel.</p>
            </div>
            
           
        </div>

        {/* Performance Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white border-b border-slate-100 text-slate-500">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Nama Cleaning Service</th>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Lokasi Tanggung Jawab</th>
                        <th className="px-3 py-4 font-semibold text-xs uppercase tracking-wider text-center w-24">Ditugaskan</th>
                        <th className="px-3 py-4 font-semibold text-xs uppercase tracking-wider text-center w-24">Pending</th>
                        <th className="px-3 py-4 font-semibold text-xs uppercase tracking-wider text-center w-24">Selesai</th>
                        <th className="px-3 py-4 font-semibold text-xs uppercase tracking-wider text-center w-36">Rata-rata Respons</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {performances.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="w-8 h-8 opacity-20" />
                                    <span>Belum ada data kinerja.</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        performances.map((perf) => {
                            const percentage = perf.totalAssigned > 0 
                                ? Math.round((perf.totalDone / perf.totalAssigned) * 100) 
                                : 0;
                            
                            return (
                                <tr key={perf.adminId} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                        {perf.adminName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {perf.locations.map(loc => (
                                                <span key={loc} className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    {loc}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 text-center font-semibold text-slate-700">
                                        {perf.totalAssigned}
                                    </td>
                                    <td className="px-3 py-4 text-center font-bold text-red-500">
                                        {perf.totalPending}
                                    </td>
                                    <td className="px-3 py-4 text-center font-bold text-green-600">
                                        {perf.totalDone}
                                    </td>
                                    <td className="px-3 py-4 text-center">
                                        {perf.avgResponseMinutes !== null ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="text-xl font-bold text-purple-600">{perf.avgResponseMinutes.toFixed(1)}</span>
                                                <span className="text-[10px] text-slate-500 mt-0.5">Menit / laporan</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-sm">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
