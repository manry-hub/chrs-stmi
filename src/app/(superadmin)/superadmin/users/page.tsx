import { getUsers } from "@/actions/users/getUsers";
import { UserManagementTable } from "@/components/superadmin/UserManagementTable";
import { Users } from "lucide-react";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      {/* Table */}
      <UserManagementTable users={users} />
    </div>
  );
}
