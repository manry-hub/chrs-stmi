"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { subscribeToReportLogs } from "@/lib/firebase/reports";
import { confirmReport } from "@/actions/reports/confirmReport";
import { ActivityLogTimeline } from "@/components/admin/ActivityLogTimeline";
import { ReportStatusBadge } from "@/components/report/ReportStatusBadge";
import { Button } from "@/components/ui/Button";
import type { ReportDocument, ReportLogDocument } from "@/types";
import toast from "react-hot-toast";
import { MapPin, Clock, User, MessageSquare, CheckCircle2, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";

interface ReportDetailClientProps {
    report: ReportDocument;
}

function formatDate(timestamp: { seconds: number } | null | undefined): string {
    if (!timestamp || !("seconds" in timestamp)) return "-";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function ReportDetailClient({ report }: ReportDetailClientProps) {
    const router = useRouter();
    const [logs, setLogs] = useState<ReportLogDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(report.status);

    useEffect(() => {
        const unsub = subscribeToReportLogs(report.id, setLogs);
        return unsub;
    }, [report.id]);

    async function handleConfirm() {
        setLoading(true);
        try {
            await confirmReport({ reportId: report.id, note: "Dikonfirmasi oleh admin" });
            setCurrentStatus("confirmed");
            toast.success("Laporan berhasil dikonfirmasi");
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : "Gagal mengkonfirmasi laporan";
            toast.error(errMessage);
        } finally {
            setLoading(false);
        }
    }

    const hasLocation = report.location?.lat && report.location?.lng;
    const mapUrl = hasLocation ? `https://www.google.com/maps?q=${report.location.lat},${report.location.lng}` : null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Dashboard
            </button>

            {/* Report Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 mb-1">Detail Laporan</h1>
                        <p className="text-xs text-slate-400 font-mono">ID: {report.id}</p>
                    </div>
                    <ReportStatusBadge status={currentStatus} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image */}
                    {report.imageUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                            {/* <Image
                src={report.imageUrl}
                alt="Foto laporan"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              /> */}
                            <img
                                src={report.imageUrl || "https://via.placeholder.com/1200x600?text=No+Image"}
                                alt="Hazard Image"
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    )}

                    {/* Info */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Pelapor</p>
                                <p className="text-sm text-slate-800 font-semibold">{report.userName}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Lokasi</p>
                                <p className="text-sm text-slate-800">{report.location?.name || "-"}</p>
                                {mapUrl && (
                                    <a
                                        href={mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                                    >
                                        Buka di Google Maps
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Waktu Laporan</p>
                                <p className="text-sm text-slate-800">{formatDate(report.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 font-medium mb-1">Deskripsi</p>
                    <p className="text-sm text-slate-800 leading-relaxed">{report.description}</p>
                </div>

                {/* Additional Message */}
                {report.additionalMessage && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-amber-700 font-medium mb-1">Pesan Tambahan</p>
                                <p className="text-sm text-amber-800">{report.additionalMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Button */}
                {currentStatus === "pending" && (
                    <div className="mt-6 pt-4 border-t border-slate-200">
                        <Button onClick={handleConfirm} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            {loading ? "Mengkonfirmasi..." : "Konfirmasi Laporan"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Riwayat Aktivitas</h2>
                <ActivityLogTimeline logs={logs} />
            </div>
        </div>
    );
}
