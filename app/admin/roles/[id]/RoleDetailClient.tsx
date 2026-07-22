"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role, ALL_PERMISSIONS, PermissionKey } from "@/types/roles";
import { saveRole } from "@/lib/roles";

interface RoleDetailClientProps {
  initialRole: Role;
}

export default function RoleDetailClient({ initialRole }: RoleDetailClientProps) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [roleName, setRoleName] = useState(initialRole.name);
  const [roleDescription, setRoleDescription] = useState(initialRole.description);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([
    ...initialRole.permissions,
  ]);

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleTogglePermission = (key: PermissionKey) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleCategoryToggle = (category: string) => {
    const categoryKeys = ALL_PERMISSIONS.filter((p) => p.category === category).map((p) => p.key);
    const allSelected = categoryKeys.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !categoryKeys.includes(p)));
    } else {
      const merged = new Set([...selectedPermissions, ...categoryKeys]);
      setSelectedPermissions(Array.from(merged));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast("error", "Role name cannot be empty.");
      return;
    }

    setSaving(true);
    const updatedRole: Role = {
      ...role,
      name: roleName.trim(),
      description: roleDescription.trim(),
      permissions: selectedPermissions,
    };

    const success = await saveRole(updatedRole);
    setSaving(false);

    if (success) {
      setRole(updatedRole);
      showToast("success", `Permissions for "${updatedRole.name}" saved successfully.`);
      router.refresh();
    } else {
      showToast("error", "Failed to update role permissions.");
    }
  };

  const categoriesList = Array.from(new Set(ALL_PERMISSIONS.map((p) => p.category)));

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition-all animate-bounce ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[#A47251]/10 bg-white p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60 block">
            Role ID
          </span>
          <span className="mt-1 font-mono text-sm font-bold text-[#2A1E17] block truncate">
            {role.id}
          </span>
        </div>

        <div className="rounded-2xl border border-[#A47251]/10 bg-white p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60 block">
            Granted System Permissions
          </span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="font-serif text-2xl font-bold text-[#2A1E17]">
              {selectedPermissions.length}
            </span>
            <span className="text-xs font-semibold text-[#2A1E17]/60">
              / {ALL_PERMISSIONS.length} total keys
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#A47251]/10 bg-white p-6 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60 block">
            Role Type
          </span>
          <span className="mt-1 font-serif text-lg font-bold text-[#2A1E17] block">
            {role.isSystemRole ? "System Protected" : "Custom User Role"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Role Name & Description Details */}
        <div className="rounded-2xl border border-[#A47251]/10 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#2A1E17]">Role Metadata</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70 mb-1">
                Role Name
              </label>
              <input
                type="text"
                required
                disabled={role.isSystemRole}
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full rounded-xl border border-[#A47251]/20 bg-white px-4 py-2.5 text-sm text-[#2A1E17] focus:border-[#DD9E59] focus:outline-none disabled:bg-[#FDF9F0]/60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70 mb-1">
                Description
              </label>
              <input
                type="text"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Description of role privileges"
                className="w-full rounded-xl border border-[#A47251]/20 bg-white px-4 py-2.5 text-sm text-[#2A1E17] focus:border-[#DD9E59] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Detailed Permission Checklist */}
        <div className="rounded-2xl border border-[#A47251]/10 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#A47251]/10 pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2A1E17]">Permission List & Capabilities</h3>
              <p className="text-xs text-[#2A1E17]/70 mt-1">
                Select or deselect individual permissions granted to users assigned this role.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 rounded-full bg-[#A47251] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all shadow-xs disabled:opacity-50 cursor-pointer self-start sm:self-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>{saving ? "Saving Changes..." : "Save Permission List"}</span>
            </button>
          </div>

          <div className="space-y-6">
            {categoriesList.map((category) => {
              const categoryPermissions = ALL_PERMISSIONS.filter((p) => p.category === category);
              const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p.key));

              return (
                <div key={category} className="rounded-xl border border-[#A47251]/10 bg-[#FDF9F0]/70 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#A47251]/10 pb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-serif text-base font-bold text-[#2A1E17]">{category}</h4>
                      <span className="text-xs text-[#2A1E17]/60">
                        ({categoryPermissions.filter((p) => selectedPermissions.includes(p.key)).length} / {categoryPermissions.length} granted)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className="text-xs font-bold uppercase tracking-wider text-[#DD9E59] hover:underline cursor-pointer"
                    >
                      {allSelected ? "Deselect Category" : "Select Entire Category"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryPermissions.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => handleTogglePermission(perm.key)}
                          className={`flex items-start space-x-4 rounded-xl p-4 border transition-all cursor-pointer ${
                            isChecked
                              ? "bg-white border-[#DD9E59] shadow-xs"
                              : "bg-white/60 border-[#A47251]/10 hover:bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-1 rounded text-[#DD9E59] focus:ring-[#DD9E59] h-4 w-4 pointer-events-none"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-[#2A1E17]">{perm.label}</span>
                              <span className="font-mono text-[10px] text-[#2A1E17]/50">{perm.key}</span>
                            </div>
                            <p className="text-xs text-[#2A1E17]/70 mt-1 leading-relaxed">{perm.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#A47251]/10 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#A47251] text-white px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Permission List"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
