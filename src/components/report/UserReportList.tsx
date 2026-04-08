"use client";

import { useUserReports } from "@/hooks/useUserReports";
import { ReportCard } from "./ReportCard";
import { Loader2 } from "lucide-react";

export function UserReportList({ userId }: { userId: string }) {
  const { reports, loading } = useUserReports(userId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
