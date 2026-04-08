"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ROUTES } from "@/constants";
import { registerUser } from "@/actions/authActions";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await registerUser(data);
      if (!res.success) {
        setError(res.error || "Gagal mendaftar");
      } else {
        router.push(ROUTES.LOGIN);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Daftar Akun Baru</h1>
        <p className="text-slate-500 mt-2 text-sm">Bergabung untuk melaporkan hazard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input id="name" placeholder="Budi Santoso" {...register("name")} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="mahasiswa@univ.edu" {...register("email")} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Nomor Telepon</Label>
          <Input id="phone" type="tel" placeholder="081234567890" {...register("phone")} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Memproses..." : "Daftar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link href={ROUTES.LOGIN} className="text-blue-600 hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
