"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema, type UserFormInput, updateUserSchema } from "@/lib/validations/user";
import { createUser } from "@/actions/users/createUser";
import { updateUser } from "@/actions/users/updateUser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { UserRole } from "@/types";

interface UserRow {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRow | null; // null for Create, User object for Edit
}

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormInput>({
    resolver: zodResolver(isEdit ? updateUserSchema : userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "user",
      password: "",
    },
  });

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: (user.role as UserRole) || "user",
        password: "", // Password not used for edit
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        role: "user",
        password: "",
      });
    }
  }, [user, reset, isOpen]);

  const onSubmit = (data: UserFormInput) => {
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateUser({ userId: user.id, data });
          toast.success("User berhasil diperbarui");
        } else {
          await createUser(data);
          toast.success("User berhasil ditambahkan");
        }
        onClose();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        toast.error(msg);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? "Edit User" : "Tambah User Baru"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 px-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Masukkan nama lengkap"
              error={errors.name?.message}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="nama@email.com"
              error={errors.email?.message}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">No. Telepon</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="08123456789"
              error={errors.phone?.message}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              {...register("role")}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Minimal 6 karakter"
                error={errors.password?.message}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                isEdit ? "Simpan Perubahan" : "Simpan User"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
