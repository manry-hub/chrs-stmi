import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/providers/ToastProvider";

/**
 * Halaman yang dipakai bersama oleh cleaning service dan kepala CS
 * (mis. profil). Civitas akademika tidak punya akun, jadi grup ini
 * tertutup untuk publik.
 */
export default async function StaffLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const role = session?.user?.role;

    if (role !== "admin" && role !== "superadmin") {
        redirect(ROUTES.LOGIN);
    }

    return (
        <AppShell role={role} userName={session?.user?.name || "Petugas"}>
            {children}

            <ToastProvider />
        </AppShell>
    );
}
