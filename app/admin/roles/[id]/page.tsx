import { getRoleById } from "@/lib/roles";
import { notFound } from "next/navigation";
import RoleDetailClient from "./RoleDetailClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SingleRolePage({ params }: PageProps) {
  const { id } = await params;
  const role = await getRoleById(id);

  if (!role) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center space-x-2 text-xs font-bold text-[#2A1E17]/60">
        <Link href="/admin/roles" prefetch={true} className="hover:text-[#DD9E59] transition-colors">
          Role & Access Manager
        </Link>
        <span>/</span>
        <span className="text-[#2A1E17]">{role.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#A47251]/10 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="font-serif text-3xl font-bold text-[#2A1E17] tracking-tight">{role.name}</h1>
            <span
              className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                role.isSystemRole
                  ? "bg-[#F0D8A1] text-[#2A1E17] border border-[#A47251]/10"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {role.isSystemRole ? "System Default Role" : "Custom Role"}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#2A1E17]/70">
            {role.description || "Manage permissions and granted capabilities for this role."}
          </p>
        </div>

        <Link
          href="/admin/roles"
          prefetch={true}
          className="inline-flex items-center space-x-2 rounded-full border border-[#A47251]/20 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2A1E17] hover:bg-[#F0D8A1]/30 transition-all shadow-2xs cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Back to All Roles</span>
        </Link>
      </div>

      <RoleDetailClient initialRole={role} />
    </div>
  );
}
