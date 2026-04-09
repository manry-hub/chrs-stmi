import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES, USER_ROLES } from "@/constants";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/providers/ToastProvider";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== USER_ROLES.USER) {
        redirect(ROUTES.LOGIN);
    }

    return (
        <AppShell role={session.user.role} userName={session.user.name || "User"}>
            {children}

            <ToastProvider />
        </AppShell>
    );
}
