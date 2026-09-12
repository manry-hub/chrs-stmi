import { getAdminPerformance } from "@/actions/admin/performance";
import { ArrowLeft, TrendingUp, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function PerformancePage() {
    const performances = await getAdminPerformance();

    // Calculate totals
    const totalAssigned = performances.reduce((acc, curr) => acc + curr.totalAssigned, 0);
    const totalDone = performances.reduce((acc, curr) => acc + curr.totalDone, 0);
    const avgCompletion = totalAssigned > 0 ? Math.round((totalDone / totalAssigned) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tracking Kinerja Admin</h1>
                    <p className="text-sm text-slate-500 mt-1">Pantau performa penyelesaian laporan oleh masing-masing admin.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Laporan (Di-assign)</p>
                        <p className="text-2xl font-bold text-slate-900">{totalAssigned}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-600 rounded-full">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Selesai</p>
                        <p className="text-2xl font-bold text-slate-900">{totalDone}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Rata-rata Penyelesaian</p>
                        <p className="text-2xl font-bold text-slate-900">{avgCompletion}%</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nama Admin</th>
                                <th className="px-6 py-4 font-semibold">Lokasi Tanggung Jawab</th>
                                <th className="px-6 py-4 font-semibold text-center">Total Ditugaskan</th>
                                <th className="px-6 py-4 font-semibold text-center text-green-600">Selesai</th>
                                <th className="px-6 py-4 font-semibold text-center text-orange-500">Pending</th>
                                <th className="px-6 py-4 font-semibold text-center">Penyelesaian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {performances.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Belum ada data kinerja.
                                    </td>
                                </tr>
                            ) : (
                                performances.map((perf) => {
                                    const percentage = perf.totalAssigned > 0 
                                        ? Math.round((perf.totalDone / perf.totalAssigned) * 100) 
                                        : 0;
                                    
                                    return (
                                        <tr key={perf.adminId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {perf.adminName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {perf.locations.map(loc => (
                                                        <span key={loc} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                                            {loc}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-slate-700">
                                                {perf.totalAssigned}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-green-600">
                                                {perf.totalDone}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-orange-500">
                                                {perf.totalPending}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-600 w-8">{percentage}%</span>
                                                </div>
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
