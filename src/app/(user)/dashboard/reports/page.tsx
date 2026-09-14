import { auth } from "@/lib/auth";
import { UserReportList } from "@/components/report/UserReportList";
import { ClipboardList } from "lucide-react";

export default async function DashboardReportsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // Layout handles redirect
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          Riwayat Laporan Saya
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">
          Pantau status laporan sumber potensi bahaya yang pernah Anda ajukan.
        </p>
      </div>

      <UserReportList userId={session.user.id} />
    </div>
  );
}
