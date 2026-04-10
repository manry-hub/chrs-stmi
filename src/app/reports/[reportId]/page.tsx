import { adminDb } from "@/lib/firebase/admin";
import { ReportDocument, ReportLogDocument } from "@/types";
import { notFound } from "next/navigation";
import { ReportStatusBadge } from "@/components/report/ReportStatusBadge";
import { MapPin, User, Calendar, MessageSquare, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants";

export const revalidate = 0;

async function getReportDetails(id: string) {
    try {
        const docRef = await adminDb.collection("reports").doc(id).get();
        if (!docRef.exists) return null;

        const logsSnapshot = await adminDb.collection("reports").doc(id).collection("logs").orderBy("createdAt", "desc").get();

        return {
            report: { id: docRef.id, ...docRef.data() } as ReportDocument,
            logs: logsSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as ReportLogDocument)),
        };
    } catch (error) {
        console.error("Error fetching report detail", error);
        return null;
    }
}

function formatDate(timestamp: any) {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
    const { reportId } = await params;
    const data = await getReportDetails(reportId);

    if (!data) return notFound();

    const { report, logs } = data;

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                    <span className="text-slate-300">/</span>
                    <Link
                        href={ROUTES.REPORTS}
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Daftar
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="aspect-video w-full bg-slate-100">
                        <img
                            src={report.imageUrl || "https://via.placeholder.com/1200x600?text=No+Image"}
                            alt="Hazard Image"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                            <ReportStatusBadge status={report.status} />
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(report.createdAt)}
                            </div>
                        </div>

                        <div className="prose max-w-none mb-8 text-slate-900">
                            <h2 className="text-xl font-semibold mb-4 leading-relaxed">{report.description}</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 rounded-lg p-5 border border-slate-100 mb-8">
                            <div className="flex gap-3 text-slate-700">
                                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lokasi</p>
                                    <p className="text-sm font-medium">{report.location.name}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 text-slate-700">
                                <User className="w-5 h-5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pelapor</p>
                                    <p className="text-sm font-medium">{report.userName}</p>
                                </div>
                            </div>

                            {report.additionalMessage && (
                                <div className="flex gap-3 text-slate-700 sm:col-span-2">
                                    <MessageSquare className="w-5 h-5 text-slate-400 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pesan Tambahan</p>
                                        <p className="text-sm">{report.additionalMessage}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {logs.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Log Riwayat Status</h3>
                                <div className="space-y-4">
                                    {logs.map((log: ReportLogDocument) => (
                                        <div key={log.id} className="bg-white border text-sm rounded-md p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="font-semibold text-slate-800 capitalize">{log.action.replace("-", " ")}</div>
                                                <div className="text-xs text-slate-500">{formatDate(log.createdAt)}</div>
                                            </div>
                                            {log.note && <p className="text-slate-600 mt-2">{log.note}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
