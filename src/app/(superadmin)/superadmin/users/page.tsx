import { getUsers } from "@/actions/users/getUsers";
import { UserManagementTable } from "@/components/superadmin/UserManagementTable";
import { Users } from "lucide-react";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen User</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola pengguna dan atur hak akses berdasarkan role.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-4 py-2 shadow-sm">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">{users.length} user terdaftar</span>
        </div>
      </div>

      {/* Table */}
      <UserManagementTable users={users} />
    </div>
  );
}
