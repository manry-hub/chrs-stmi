"use client";

import { useState, useTransition } from "react";
import { deleteUser } from "@/actions/users/deleteUser";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UserModal } from "./UserModal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { Trash2, Shield, UserPlus, Edit2 } from "lucide-react";

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

export function UserManagementTable({ users: initialUsers }: UserManagementTableProps) {
  // We use the initialUsers directly from props as Next.js handles re-fetching via revalidatePath
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      <div className="flex justify-start mb-6">
        <Button onClick={handleCreate} className="shadow-lg shadow-blue-500/20">
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah User Baru
        </Button>
      </div>

      {initialUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">Belum ada user</h3>
          <p className="text-sm text-slate-500">User yang terdaftar akan muncul di sini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Nama</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Email</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Telepon</th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600">Role</th>
                  <th className="text-right py-3.5 px-4 font-semibold text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                    <td className="py-3 px-4 font-medium text-slate-800">{user.name || "-"}</td>
                    <td className="py-3 px-4 text-slate-600">{user.email || "-"}</td>
                    <td className="py-3 px-4 text-slate-600">{user.phone || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${ROLE_COLORS[user.role || "user"] || ROLE_COLORS.user}`}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
