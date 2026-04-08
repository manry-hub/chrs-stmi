import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ROUTES, USER_ROLES } from "@/constants";
import { EmergencyCallButton } from "@/components/ui/EmergencyCallButton";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session || session.user.role !== USER_ROLES.USER) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">HazardReport - Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{session.user.name}</span>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <EmergencyCallButton />
    </div>
  );
}
