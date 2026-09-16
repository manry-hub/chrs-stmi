"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeToReportLogs } from "@/lib/firebase/reports";
import { confirmReport } from "@/actions/reports/confirmReport";
import { markReportDone } from "@/actions/reports/markReportDone";
import { uploadReportImage } from "@/lib/uploadImage";
import { getDeviceId } from "@/lib/deviceId";
import { ActivityLogTimeline } from "@/components/admin/ActivityLogTimeline";
import { ReportStatusBadge } from "@/components/report/ReportStatusBadge";
import { ImagePreview } from "@/components/report/ImagePreview";
import { Button } from "@/components/ui/Button";
import type { ReportDocument, ReportLogDocument } from "@/types";
import toast from "react-hot-toast";
import { MapPin, Clock, User, MessageSquare, CheckCircle2, ArrowLeft, ExternalLink, Loader2, AlertTriangle } from "lucide-react";

interface ReportDetailClientProps {
    report: ReportDocument;
    currentUserId?: string;
    currentUserRole?: string;
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

export function ReportDetailClient({ report, currentUserId, currentUserRole }: ReportDetailClientProps) {
    const router = useRouter();
    const [logs, setLogs] = useState<ReportLogDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(report.status);
    const [confirmedBy, setConfirmedBy] = useState(report.confirmedBy);
    const [proofImage, setProofImage] = useState<File | undefined>();
    const [proofImageUrl, setProofImageUrl] = useState<string | undefined>(report.proofImageUrl);

    useEffect(() => {
        const unsub = subscribeToReportLogs(report.id, setLogs);
        return unsub;
    }, [report.id]);

    async function handleConfirm() {
        setLoading(true);
        try {
            await confirmReport({ reportId: report.id });
            setCurrentStatus("confirmed");
            setConfirmedBy(currentUserId);
            toast.success("Laporan berhasil dikonfirmasi");
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : "Gagal mengkonfirmasi laporan";
            toast.error(errMessage);
        } finally {
            setLoading(false);
        }
    }

    async function handleDone() {
        if (!proofImage) {
            toast.error("Silakan unggah foto bukti penyelesaian");
            return;
        }

        setLoading(true);
        try {
            const uploadedUrl = await uploadReportImage(proofImage, getDeviceId());

            await markReportDone({ reportId: report.id, proofImageUrl: uploadedUrl });
            setCurrentStatus("done");
            setProofImageUrl(uploadedUrl);
            toast.success("Laporan berhasil ditandai selesai");
        } catch (err) {
            const errMessage = err instanceof Error ? err.message : "Gagal menyelesaikan laporan";
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
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 mb-0.5 sm:mb-1">Detail Laporan</h1>
                    </div>
                    <div className="shrink-0">
                        <ReportStatusBadge status={currentStatus} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                                {report.locationVerified === false && (
                                    <p className="inline-flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mt-2">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>
                                            Lokasi belum terverifikasi GPS. Lokasi di atas diisi manual oleh pelapor,
                                            jadi mohon dicek sendiri kebenarannya.
                                        </span>
                                    </p>
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
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-50 rounded-lg">
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium mb-1">Deskripsi</p>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{report.description}</p>
                </div>

                {/* Additional Message */}
                {report.additionalMessage && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[11px] sm:text-xs text-amber-700 font-medium mb-1">Detail lokasi atau deskripsi</p>
                                <p className="text-xs sm:text-sm text-amber-800">{report.additionalMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Proof Image / Upload Section */}
                {(currentStatus === "confirmed" || (currentStatus === "done" && proofImageUrl)) && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-3 sm:mb-4">Bukti Penyelesaian</p>
                        
                        {currentStatus === "confirmed" ? (
                            <ImagePreview onImageSelected={(file) => setProofImage(file || undefined)} />
                        ) : (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                <img
                                    src={proofImageUrl || "https://via.placeholder.com/1200x600?text=No+Image"}
                                    alt="Foto Bukti Penyelesaian"
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Confirm Button */}
                {currentStatus === "pending" && (
                    <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-200 flex">
                        <Button onClick={handleConfirm} disabled={loading} className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            {loading ? "Mengkonfirmasi..." : "Konfirmasi Laporan"}
                        </Button>
                    </div>
                )}

                {/* Complete Button */}
                {currentStatus === "confirmed" && (
                    <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-200 flex flex-col gap-3">
                        {confirmedBy && confirmedBy !== currentUserId && currentUserRole !== "superadmin" ? (
                            <div className="bg-red-50 text-red-700 text-xs sm:text-sm p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 border border-red-100">
                                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" />
                                <p>Laporan ini dikonfirmasi oleh petugas lain. Hanya petugas tersebut atau Superadmin yang memiliki hak akses untuk menyelesaikannya.</p>
                            </div>
                        ) : (
                            <Button onClick={handleDone} disabled={loading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {loading ? "Menyelesaikan..." : "Selesaikan Laporan"}
                            </Button>
                        )}
                    </div>
                )}
            </div>

           
        </div>
    );
}
