"use client";

import { useUserReports } from "@/hooks/useUserReports";
import { ReportCard } from "./ReportCard";
import { Loader2 } from "lucide-react";

export function UserReportList({ userId }: { userId: string }) {
  const { reports, loading, error } = useUserReports(userId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        <p className="font-semibold mb-1">Terjadi kesalahan saat memuat laporan:</p>
        <p className="opacity-80">{error}</p>
        <p className="mt-2 text-xs italic">
          Bila ini kesalahan pertama, kemungkinan database sedang melakukan pembaharuan indeks. Silakan coba lagi dalam beberapa menit.
        </p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-100 shadow-sm">
        <p className="text-slate-500">Anda belum pernah membuat laporan hazard.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
