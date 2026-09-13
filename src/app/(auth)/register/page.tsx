"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ROUTES } from "@/constants";
import { registerUser } from "@/actions/auth/registerUser";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const loc = searchParams.get("loc");

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
            if (res.success) {
                // Preserve loc param through to login page
                const loginPath = loc ? `${ROUTES.LOGIN}?loc=${loc}` : ROUTES.LOGIN;
                router.push(loginPath);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Terjadi kesalahan sistem");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Build login link with loc param preserved
    const loginHref = loc ? `${ROUTES.LOGIN}?loc=${loc}` : ROUTES.LOGIN;

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-900">Daftar Akun Baru</h1>
                <p className="text-slate-500 mt-2 text-sm">Bergabung untuk melaporkan sumber potensi bahaya</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" placeholder="Budi Santoso" {...register("name")} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input id="phone" type="tel" placeholder="081234567890" {...register("phone")} />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="mahasiswa@univ.edu" {...register("email")} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>


                <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} className="pr-10" />
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

                <div>
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <div className="relative">
                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} className="pr-10" />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Memproses..." : "Daftar"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
                Sudah punya akun?{" "}
                <Link href={loginHref} className="text-blue-600 hover:underline">
                    Masuk di sini
                </Link>
            </p>
        </div>
    );
}
