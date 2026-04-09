import { ReportSubmitForm } from "@/components/report/ReportSubmitForm";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-blue-600" />
          Lapor Hazard Baru
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gunakan form di bawah untuk melaporkan kondisi berbahaya di sekitar kampus.
        </p>
      </div>

      <div className="max-w-3xl">
        <ReportSubmitForm />
      </div>
    </div>
  );
}
