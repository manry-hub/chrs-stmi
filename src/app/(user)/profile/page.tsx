import { getProfile } from "@/actions/users/getProfile";
import { ProfileForm } from "./ProfileForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profil | HazardReport",
};

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profil Saya</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola informasi profil dan kata sandi Anda</p>
      </div>

      <ProfileForm initialData={profile} />
    </div>
  );
}
