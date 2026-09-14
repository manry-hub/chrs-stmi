import { getUsers } from "@/actions/users/getUsers";
import { UserManagementTable } from "@/components/superadmin/UserManagementTable";
import { Users } from "lucide-react";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manajemen User</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola pengguna dan atur hak akses.
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center justify-center gap-2 bg-white rounded-lg border border-slate-200 px-4 py-2 shadow-sm shrink-0">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">{users.length} user terdaftar</span>
        </div>
      </div>

      {/* Table */}
      <UserManagementTable users={users} />
    </div>
  );
}
