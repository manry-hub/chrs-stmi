import { auth } from "@/lib/auth/auth";
import { UserReportList } from "@/components/report/UserReportList";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { ArrowLeft, Clock } from "lucide-react";

export default async function DashboardReportsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // Layout handles redirect
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Riwayat Laporan Saya
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Pantau status laporan hazard yang pernah Anda ajukan secara real-time.
          </p>
        </div>
        <Link 
          href={ROUTES.DASHBOARD}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-sm transition-colors whitespace-nowrap border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Form Lapor
        </Link>
      </div>

      <UserReportList userId={session.user.id} />
    </div>
  );
}
