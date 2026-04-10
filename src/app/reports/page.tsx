import { adminDb } from "@/lib/firebase/admin";
import { ReportCard } from "@/components/report/ReportCard";
import { ReportDocument } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants";

export const revalidate = 0; // Dynamic rendering

async function getPublicReports() {
    try {
        const snapshot = await adminDb.collection("reports").orderBy("createdAt", "desc").limit(50).get();

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt, // Firebase Admin timestamp
            } as ReportDocument;
        });
    } catch (error) {
        console.error("Error fetching public reports:", error);
        return [];
    }
}

export default async function PublicReportsPage() {
    const reports = await getPublicReports();

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href={ROUTES.HOME}
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Home
                </Link>
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">Daftar Sumber Potensi Bahaya Kampus</h1>
                    <p className="mt-4 text-slate-500">
                        Berikut adalah daftar laporan sumber potensi bahaya yang telah dikirimkan oleh civitas akademika. Semua laporan bersifat
                        transparan untuk meningkatkan kesadaran bersama.
                    </p>
                </div>

                {reports.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-slate-100 shadow-sm">
                        <p className="text-slate-500">Belum ada laporan sumber potensi bahaya yang masuk.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {reports.map((report: ReportDocument) => (
                            <ReportCard key={report.id} report={report} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
