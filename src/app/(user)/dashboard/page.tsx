import { ReportSubmitForm } from "@/components/report/ReportSubmitForm";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { ListCollapse, PlusCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Lapor Hazard Baru
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gunakan form di bawah untuk melaporkan kondisi berbahaya di sekitar kampus.
          </p>
        </div>
        <Link 
          href={ROUTES.DASHBOARD_REPORTS}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-sm transition-colors whitespace-nowrap border border-slate-200 shadow-sm"
        >
          <ListCollapse className="w-4 h-4" />
          Riwayat Laporan Saya
        </Link>
      </div>

      <div className="max-w-3xl">
        <ReportSubmitForm />
      </div>
    </div>
  );
}
