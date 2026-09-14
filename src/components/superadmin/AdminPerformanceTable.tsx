import { AdminPerformance } from "@/actions/admin/performance";
import { FileText } from "lucide-react";

interface AdminPerformanceTableProps {
  performances: AdminPerformance[];
}

export function AdminPerformanceTable({ performances }: AdminPerformanceTableProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Unified Header & Summary */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Kinerja per Cleaning Service</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Pantau performa penyelesaian laporan oleh masing-masing personel.</p>
          </div>
      </div>

      {/* Performance Table */}
      <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-white border-b border-slate-100 text-slate-500">
                  <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider">Nama Cleaning Service</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider">Lokasi Tanggung Jawab</th>
                      <th className="px-2 sm:px-3 py-3 sm:py-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider text-center w-20 sm:w-24">Ditugaskan</th>
                      <th className="px-2 sm:px-3 py-3 sm:py-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider text-center w-20 sm:w-24">Pending</th>
                      <th className="px-2 sm:px-3 py-3 sm:py-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider text-center w-20 sm:w-24">Selesai</th>
                      <th className="px-2 sm:px-3 py-3 sm:py-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider text-center w-28 sm:w-36">Rata-rata Respons</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {performances.length === 0 ? (
                      <tr>
                          <td colSpan={6} className="px-4 sm:px-6 py-8 sm:py-12 text-center text-slate-400">
                              <div className="flex flex-col items-center gap-2">
                                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 opacity-20" />
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
                                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900">
                                      {perf.adminName}
                                  </td>
                                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                                      <div className="flex flex-wrap gap-1.5">
                                          {perf.locations.map(loc => (
                                              <span key={loc} className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                  {loc}
                                              </span>
                                          ))}
                                      </div>
                                  </td>
                                  <td className="px-2 sm:px-3 py-3 sm:py-4 text-center font-semibold text-slate-700">
                                      {perf.totalAssigned}
                                  </td>
                                  <td className="px-2 sm:px-3 py-3 sm:py-4 text-center font-bold text-red-500">
                                      {perf.totalPending}
                                  </td>
                                  <td className="px-2 sm:px-3 py-3 sm:py-4 text-center font-bold text-green-600">
                                      {perf.totalDone}
                                  </td>
                                  <td className="px-2 sm:px-3 py-3 sm:py-4 text-center">
                                      {perf.avgResponseMinutes !== null ? (
                                          <div className="flex flex-col items-center justify-center">
                                              <span className="text-lg sm:text-xl font-bold text-purple-600">{perf.avgResponseMinutes.toFixed(1)}</span>
                                              <span className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5">Menit / laporan</span>
                                          </div>
                                      ) : (
                                          <span className="text-slate-300 text-xs sm:text-sm">-</span>
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
  );
}
