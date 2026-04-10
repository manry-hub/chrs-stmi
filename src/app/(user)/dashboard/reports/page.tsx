import { auth } from "@/lib/auth";
import { UserReportList } from "@/components/report/UserReportList";
import { ClipboardList } from "lucide-react";

export default async function DashboardReportsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // Layout handles redirect
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Riwayat Laporan Saya
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pantau status laporan sumber potensi bahaya yang pernah Anda ajukan secara real-time.
        </p>
      </div>

      <UserReportList userId={session.user.id} />
    </div>
  );
}
