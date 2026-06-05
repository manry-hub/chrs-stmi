import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/providers/ToastProvider";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect superadmin routes - allow ONLY superadmin
  if (!session || session.user.role !== "superadmin") {
    redirect("/login");
  }

  return (
    <AppShell role={session.user.role} userName={session.user.name || "Superadmin"}>
      {children}
      <ToastProvider />
    </AppShell>
  );
}
