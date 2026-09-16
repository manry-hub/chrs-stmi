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
  const role = session?.user?.role;

  // Protect admin routes - allow admin and superadmin
  if (role !== "admin" && role !== "superadmin") {
    redirect("/login");
  }

  return (
    <AppShell role={role} userName={session?.user?.name || "Admin"}>
      {children}
      <ToastProvider />
    </AppShell>
  );
}
