import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/providers/ToastProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect admin routes - allow admin and superadmin
  if (!session || !["admin", "superadmin"].includes(session.user.role)) {
    redirect("/login");
  }

  return (
    <AppShell role={session.user.role} userName={session.user.name || "Admin"}>
      {children}
      <ToastProvider />
    </AppShell>
  );
}
