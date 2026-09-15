"use client";

import { useState, useTransition } from "react";
import { deleteUser } from "@/actions/users/deleteUser";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UserModal } from "./UserModal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { Trash2, Shield, UserPlus, Edit2, Users } from "lucide-react";

interface UserRow {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface UserManagementTableProps {
  users: UserRow[];
}

const ROLE_COLORS: Record<string, string> = {
  user: "bg-slate-100 text-slate-700",
  admin: "bg-blue-100 text-blue-700",
  superadmin: "bg-purple-100 text-purple-700",
};

const ROLE_LABELS: Record<string, string> = {
  user: "Civitas Akademika",
  admin: "Cleaning Service",
  superadmin: "Kepala CS",
};

export function UserManagementTable({ users: initialUsers }: UserManagementTableProps) {
  // We use the initialUsers directly from props as Next.js handles re-fetching via revalidatePath
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const filteredUsers = filterRole === "all" 
    ? initialUsers 
    : initialUsers.filter(u => (u.role || "user") === filterRole);

  const handleCreate = () => {
    setEditTarget(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserRow) => {
    setEditTarget(user);
    setIsModalOpen(true);
  };

  async function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteUser(deleteTarget.id);
        toast.success("User berhasil dihapus");
        setDeleteTarget(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gagal menghapus user";
        toast.error(msg);
        setDeleteTarget(null);
      }
    });
  }

  return (
    <>
      {/* Page Header integrated in Client Component to share Modal state */}
      <div className="flex flex-row justify-between items-start gap-4 mb-2 sm:mb-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manajemen User</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola pengguna dan atur hak akses.
          </p>
        </div>
        <div className="shrink-0 mt-1 sm:mt-0">
          <Button onClick={handleCreate} size="sm" className="shadow-lg shadow-blue-500/20 text-xs sm:text-sm px-2 sm:px-4 hidden sm:flex">
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Tambah User Baru</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
          <Button onClick={handleCreate} size="sm" className="shadow-lg shadow-blue-500/20 text-[10px] px-2 h-8 flex sm:hidden">
            <UserPlus className="w-3 h-3 mr-1" />
            Tambah
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-4 sm:mt-0">
        <div className="flex w-full sm:w-auto items-center justify-center gap-2 bg-white rounded-lg border border-slate-200 px-4 py-2 shadow-sm shrink-0">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">{initialUsers.length} user terdaftar</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-fit overflow-x-auto shrink-0">
            <button
                onClick={() => setFilterRole("all")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterRole === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Semua
            </button>
            <button
                onClick={() => setFilterRole("superadmin")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterRole === "superadmin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Kepala CS
            </button>
            <button
                onClick={() => setFilterRole("admin")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterRole === "admin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Cleaning Service
            </button>
            <button
                onClick={() => setFilterRole("user")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filterRole === "user" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
                Civitas Akademika
            </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">Belum ada user</h3>
          <p className="text-sm text-slate-500">User yang terdaftar akan muncul di sini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left py-2.5 sm:py-3.5 px-3 sm:px-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] sm:text-xs">Nama</th>
                  <th className="text-left py-2.5 sm:py-3.5 px-3 sm:px-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] sm:text-xs">Email</th>
                  <th className="text-left py-2.5 sm:py-3.5 px-3 sm:px-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] sm:text-xs">Telepon</th>
                  <th className="text-left py-2.5 sm:py-3.5 px-3 sm:px-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] sm:text-xs">Role</th>
                  <th className="text-right py-2.5 sm:py-3.5 px-3 sm:px-4 font-semibold text-slate-600 uppercase tracking-wider text-[10px] sm:text-xs">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-slate-800">{user.name || "-"}</td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-slate-600">{user.email || "-"}</td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-slate-600">{user.phone || "-"}</td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                      <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${ROLE_COLORS[user.role || "user"] || ROLE_COLORS.user}`}>
                        {ROLE_LABELS[user.role || "user"] || "Civitas Akademika"}
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
                        >
                          <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 disabled:opacity-50 hover:scale-[1.05] active:scale-[0.95]"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus user "${deleteTarget?.name || deleteTarget?.email}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={isPending}
      />
    </>
  );
}
