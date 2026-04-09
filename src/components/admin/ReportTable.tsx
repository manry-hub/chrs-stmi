"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ReportStatusBadge } from "@/components/report/ReportStatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteReport } from "@/actions/reports/deleteReport";
import toast from "react-hot-toast";
import type { ReportDocument } from "@/types";
import { MapPin, Clock, Eye, Trash2 } from "lucide-react";

interface ReportTableProps {
    reports: ReportDocument[];
    baseUrl?: string;
    allowDelete?: boolean;
}

function formatDate(timestamp: { seconds: number } | null | undefined): string {
    if (!timestamp || !("seconds" in timestamp)) return "-";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function ReportTable({ reports, baseUrl = "/admin/reports", allowDelete = false }: ReportTableProps) {
    const [deleteTarget, setDeleteTarget] = useState<ReportDocument | null>(null);
    const [isPending, startTransition] = useTransition();

    async function handleDelete() {
        if (!deleteTarget) return;

        startTransition(async () => {
            try {
                await deleteReport(deleteTarget.id);
                toast.success("Laporan berhasil dihapus");
                // We do not manually handle the state filter removal here because
                // the reports are injected via a real-time Firestore hook ('subscribeToAllReportsAdmin').
                setDeleteTarget(null);
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Gagal menghapus laporan";
                toast.error(msg);
                setDeleteTarget(null);
            }
        });
    }

    if (reports.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Belum ada laporan</h3>
                <p className="text-sm text-slate-500">Laporan baru akan muncul di sini secara real-time.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70">
                                <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Pelapor</th>
                                <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Lokasi</th>
                                <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Deskripsi</th>
                                <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Status</th>
                                <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Waktu</th>
                                <th className="text-right py-3.5 px-4 font-semibold text-slate-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                                    <td className="py-3 px-4">
                                        <span className="font-medium text-slate-800">{report.userName}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="truncate max-w-[160px]">{report.location?.name || "-"}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-slate-600 truncate block max-w-[200px]">
                                            {report.description?.length > 60 ? report.description.slice(0, 60) + "..." : report.description}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <ReportStatusBadge status={report.status} />
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDate(report.createdAt)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`${baseUrl}/${report.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Detail
                                            </Link>

                                            {allowDelete && (
                                                <button
                                                    onClick={() => setDeleteTarget(report)}
                                                    disabled={isPending}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors duration-200 disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Hapus Laporan"
                message="Apakah Anda yakin ingin menghapus laporan ini? Seluruh data riwayat aktivitas terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan."
                confirmLabel="Hapus Laporan"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={isPending}
            />
        </>
    );
}
