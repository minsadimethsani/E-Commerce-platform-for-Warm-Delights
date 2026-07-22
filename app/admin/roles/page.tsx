import { getAllRoles, getAllUsers } from "@/lib/roles";
import RolesClient from "./RolesClient";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const [roles, users] = await Promise.all([
    getAllRoles(),
    getAllUsers(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2A1E17] tracking-tight">Role & Staff Access Manager</h1>
        <p className="mt-1 text-sm text-[#2A1E17]/70">
          Configure custom administrative roles, grant fine-grained system permissions, and assign roles to bakery staff members.
        </p>
      </div>

      <RolesClient initialRoles={roles} initialUsers={users} />
    </div>
  );
}
