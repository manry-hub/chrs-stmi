"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ROUTES } from "@/constants";
import { Eye, EyeOff } from "lucide-react";

/** Determine the correct landing page based on user role */
function getRedirectPath(role?: string): string {
    switch (role) {
        case "superadmin":
            return "/superadmin";
        case "admin":
            return "/admin";
        default:
            // Akun civitas lama: tidak punya area khusus lagi, arahkan ke form publik.
            return ROUTES.LAPOR;
    }
}

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            if (res?.error) {
                setError("Email atau password salah");
            } else {
                // Fetch fresh session to get role, then redirect accordingly
                const session = await getSession();
                const redirectPath = getRedirectPath(session?.user?.role);
                router.push(redirectPath);
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
                <h1 className="text-2xl font-bold text-slate-900">Masuk Akun</h1>
                <p className="text-slate-500 mt-2 text-sm">Khusus petugas cleaning service dan kepala CS</p>
            </div>

            <form data-testid="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                {error && <div data-testid="login-error" role="alert" className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

                <Button data-testid="login-submit" type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Memproses..." : "Masuk"}
                </Button>
            </form>

            
        </div>
    );
}
