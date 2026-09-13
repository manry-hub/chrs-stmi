"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import Link from "next/link";
import { MapPin, CheckCircle2 } from "lucide-react";
import { NotifyAdminButton } from "@/components/superadmin/NotifyAdminButton";
import { NotifyAllAdminsButton } from "@/components/superadmin/NotifyAllAdminsButton";

interface PendingReport {
  id: string;
  description: string;
  locationName: string;
  createdAt: string | null;
}

interface SuperadminChartsProps {
    total: number;
    pendingList: PendingReport[];
    topSources: { name: string; count: number }[];
}

export function SuperadminCharts({ total, pendingList, topSources }: SuperadminChartsProps) {
    const colors = ["#ef4444", "#f97316", "#eab308"]; // red-500, orange-500, yellow-500
    const barData = topSources.map((source, index) => ({
        name: source.name,
        value: source.count,
        fill: colors[index % colors.length],
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Pending Reports List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[300px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-700">Laporan Menunggu Tindakan</h3>
                    <NotifyAllAdminsButton reportIds={pendingList.map(r => r.id)} />
                </div>
                
                {pendingList.length > 0 ? (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {pendingList.map(report => (
                            <Link href={`/superadmin/reports/${report.id}`} key={report.id} className="block group">
                                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 group-hover:bg-amber-50/50 group-hover:border-amber-100 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{report.description || "Tanpa deskripsi"}</p>
                                        <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center text-xs text-slate-500">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            <span className="truncate max-w-[150px]">{report.locationName}</span>
                                        </div>
                                        <NotifyAdminButton reportId={report.id} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-sm font-medium">Tidak ada laporan menunggu</span>
                    </div>
                )}
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[300px]">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Top 3 Sumber Potensi Bahaya </h3>
                {barData.length > 0 ? (
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                    cursor={{ fill: "transparent" }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="w-full h-64 flex items-center justify-center text-slate-400 text-sm">Belum ada data</div>
                )}
            </div>
        </div>
    );
}
