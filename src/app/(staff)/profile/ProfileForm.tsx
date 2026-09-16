"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, UpdateProfileInput } from "@/lib/validations/user";
import { updateProfile } from "@/actions/users/updateProfile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialData: {
    name: string;
    phone: string;
    email: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialData.name,
      phone: initialData.phone,
      password: "",
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      toast.success("Profil berhasil diperbarui");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div>
        <Label htmlFor="email">Email (Tidak dapat diubah)</Label>
        <Input id="email" type="email" value={initialData.email} disabled className="bg-slate-50 text-slate-500" />
      </div>

      <div>
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input id="name" type="text" {...register("name")} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Nomor Telepon</Label>
        <Input id="phone" type="text" {...register("phone")} />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password Baru (Kosongkan jika tidak ingin mengubah)</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className="pr-10"
            placeholder="Masukkan password baru"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
