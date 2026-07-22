"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Role, ALL_PERMISSIONS, PermissionKey, SYSTEM_ROLES } from "@/types/roles";
import { UserProfile } from "@/types/database";
import { saveRole, deleteRole, assignUserRole } from "@/lib/roles";

interface RolesClientProps {
  initialRoles: Role[];
  initialUsers: UserProfile[];
}

export default function RolesClient({ initialRoles, initialUsers }: RolesClientProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);

  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Role Builder Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);

  const [saving, setSaving] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Real-time Firestore snapshot listeners
  useEffect(() => {
    const unsubRoles = onSnapshot(collection(db, "roles"), (snapshot) => {
      const custom: Role[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        custom.push({
          id: docSnap.id,
          name: data.name,
          description: data.description || "",
          permissions: data.permissions || [],
          isSystemRole: data.isSystemRole || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      const map = new Map<string, Role>();
      SYSTEM_ROLES.forEach((sr) => map.set(sr.id, sr));
      custom.forEach((cr) => map.set(cr.id, cr));
      setRoles(Array.from(map.values()));
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          uid: docSnap.id,
          email: data.email || "",
          displayName: data.displayName || "",
          role: data.role || "customer",
          shippingAddresses: data.shippingAddresses || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as any);
      });
      setUsers(list);
    });

    return () => {
      unsubRoles();
      unsubUsers();
    };
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setSelectedPermissions([...role.permissions]);
    setIsModalOpen(true);
  };

  const handleTogglePermission = (key: PermissionKey) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSelectAllCategoryPermissions = (category: string) => {
    const categoryKeys = ALL_PERMISSIONS.filter((p) => p.category === category).map((p) => p.key);
    const allSelected = categoryKeys.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !categoryKeys.includes(p)));
    } else {
      const merged = new Set([...selectedPermissions, ...categoryKeys]);
      setSelectedPermissions(Array.from(merged));
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast("error", "Please provide a valid role name.");
      return;
    }

    setSaving(true);
    const roleId = editingRole ? editingRole.id : `role-${Date.now()}`;
    const payload: Role = {
      id: roleId,
      name: roleName.trim(),
      description: roleDescription.trim(),
      permissions: selectedPermissions,
      isSystemRole: editingRole?.isSystemRole || false,
    };

    const success = await saveRole(payload);
    setSaving(false);

    if (success) {
      showToast("success", `Role "${payload.name}" successfully saved.`);
      setIsModalOpen(false);
    } else {
      showToast("error", "Failed to save role. Please check database permissions.");
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystemRole) {
      showToast("error", "System default roles cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to delete custom role "${role.name}"?`)) return;

    const success = await deleteRole(role.id);
    if (success) {
      showToast("success", `Role "${role.name}" deleted.`);
    } else {
      showToast("error", "Failed to delete role.");
    }
  };

  const handleAssignRole = async (userId: string, newRoleId: string) => {
    setAssigningUserId(userId);
    const success = await assignUserRole(userId, newRoleId);
    setAssigningUserId(null);

    if (success) {
      showToast("success", "Staff member role updated.");
    } else {
      showToast("error", "Failed to assign role.");
    }
  };

  // Filter staff accounts (accounts with admin dashboard access)
  const staffUsers = users.filter((u) => u.role && u.role !== "customer");
  const customerUsers = users.filter((u) => !u.role || u.role === "customer");

  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaffUserId, setNewStaffUserId] = useState("");
  const [newStaffRoleId, setNewStaffRoleId] = useState("bakery-staff");

  const categoriesList = Array.from(new Set(ALL_PERMISSIONS.map((p) => p.category)));

  const filteredUsers = staffUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePromoteCustomerToStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffUserId) {
      showToast("error", "Please select a registered customer account.");
      return;
    }
    setAssigningUserId(newStaffUserId);
    const success = await assignUserRole(newStaffUserId, newStaffRoleId);
    setAssigningUserId(null);

    if (success) {
      showToast("success", "Selected user granted staff access.");
      setIsAddStaffModalOpen(false);
      setNewStaffUserId("");
    } else {
      showToast("error", "Failed to grant staff access.");
    }
  };

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

      {/* Tab Switcher & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#A47251]/10 pb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "roles"
                ? "bg-[#DD9E59] text-[#2A1E17] shadow-xs"
                : "bg-white text-[#2A1E17]/70 hover:bg-[#F0D8A1]/30"
            }`}
          >
            Role Definitions ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-[#DD9E59] text-[#2A1E17] shadow-xs"
                : "bg-white text-[#2A1E17]/70 hover:bg-[#F0D8A1]/30"
            }`}
          >
            Staff Assignments ({staffUsers.length})
          </button>
        </div>

        {activeTab === "roles" ? (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 bg-[#A47251] text-white rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer shadow-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Create Custom Role</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddStaffModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-[#A47251] text-white rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer shadow-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
            <span>Grant Staff Access</span>
          </button>
        )}
      </div>

      {/* TAB 1: ROLES OVERVIEW (TABLE ROWS FORMAT) */}
      {activeTab === "roles" && (
        <div className="overflow-hidden rounded-2xl border border-[#A47251]/10 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#A47251]/10">
              <thead className="bg-[#F0D8A1]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70">Role Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70">Capabilities</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A47251]/5 bg-white">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-[#F0D8A1]/20 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link
                        href={`/admin/roles/${role.id}`}
                        prefetch={true}
                        className="font-serif font-bold text-base text-[#2A1E17] hover:text-[#DD9E59] transition-colors"
                      >
                        {role.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          role.isSystemRole
                            ? "bg-[#F0D8A1] text-[#2A1E17] border border-[#A47251]/10"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {role.isSystemRole ? "System Default" : "Custom Role"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#2A1E17]/70 max-w-sm leading-relaxed">
                      {role.description || "No description provided."}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center space-x-1.5 rounded-full bg-[#FDF9F0] border border-[#A47251]/20 px-3 py-1 text-xs font-bold text-[#2A1E17]">
                        <span>{role.permissions.length}</span>
                        <span className="text-[10px] font-normal text-[#2A1E17]/60">/ {ALL_PERMISSIONS.length} permissions</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right space-x-3">
                      <Link
                        href={`/admin/roles/${role.id}`}
                        prefetch={true}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-[#DD9E59] hover:text-[#2A1E17] transition-colors"
                      >
                        <span>View Permissions</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                      {!role.isSystemRole && (
                        <button
                          onClick={() => handleDeleteRole(role)}
                          className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF ROLE ASSIGNMENTS */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Search bar & info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="max-w-md w-full">
              <input
                type="text"
                placeholder="Search staff members by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#A47251]/20 bg-white px-4 py-2.5 text-sm text-[#2A1E17] placeholder:text-[#2A1E17]/40 focus:border-[#DD9E59] focus:outline-none"
              />
            </div>
            <p className="text-xs text-[#2A1E17]/60">
              Displaying <span className="font-bold text-[#2A1E17]">{filteredUsers.length}</span> staff member account(s)
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#A47251]/10 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#A47251]/10">
                <thead className="bg-[#F0D8A1]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70">Staff Member</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70">Current Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70">Modify Assigned Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#A47251]/5 bg-white">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-[#2A1E17]/60">
                        No staff accounts found. Click "Grant Staff Access" to promote a customer account to staff.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const currentRole = roles.find((r) => r.id === u.role || r.name.toLowerCase() === u.role.toLowerCase());
                      return (
                        <tr key={u.uid} className="hover:bg-[#F0D8A1]/20 transition-colors">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DD9E59] text-[#2A1E17] font-bold text-sm">
                                {u.displayName?.[0]?.toUpperCase() || u.email[0]?.toUpperCase() || "S"}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-[#2A1E17]">
                                  {u.displayName || "Staff Member"}
                                </h4>
                                <span className="text-xs text-[#2A1E17]/60">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-block rounded-md bg-[#FDF9F0] border border-[#A47251]/20 px-3 py-1 text-xs font-bold text-[#2A1E17]">
                              {currentRole ? currentRole.name : u.role}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <select
                              value={u.role}
                              disabled={assigningUserId === u.uid}
                              onChange={(e) => handleAssignRole(u.uid, e.target.value)}
                              className="rounded-xl border border-[#A47251]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#2A1E17] focus:border-[#DD9E59] focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="admin">Super Admin</option>
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} {r.isSystemRole ? "(System)" : "(Custom)"}
                                </option>
                              ))}
                              <option value="customer">Revoke Staff Access (Demote to Customer)</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GRANT STAFF ACCESS MODAL */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col border border-[#A47251]/20">
            <div className="flex items-center justify-between px-6 py-4 bg-[#F0D8A1] border-b border-[#A47251]/10">
              <h3 className="font-serif text-lg font-bold text-[#2A1E17]">Grant Staff Access</h3>
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="text-[#2A1E17]/60 hover:text-[#2A1E17] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePromoteCustomerToStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70 mb-1">
                  Select User Account *
                </label>
                <select
                  required
                  value={newStaffUserId}
                  onChange={(e) => setNewStaffUserId(e.target.value)}
                  className="w-full rounded-xl border border-[#A47251]/20 bg-white px-4 py-2.5 text-sm text-[#2A1E17] focus:border-[#DD9E59] focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose Registered Customer --</option>
                  {customerUsers.map((cu) => (
                    <option key={cu.uid} value={cu.uid}>
                      {cu.displayName ? `${cu.displayName} (${cu.email})` : cu.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70 mb-1">
                  Assign Staff Role *
                </label>
                <select
                  value={newStaffRoleId}
                  onChange={(e) => setNewStaffRoleId(e.target.value)}
                  className="w-full rounded-xl border border-[#A47251]/20 bg-white px-4 py-2.5 text-sm text-[#2A1E17] focus:border-[#DD9E59] focus:outline-none cursor-pointer"
                >
                  <option value="admin">Super Admin</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#A47251]/10">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70 hover:bg-[#A47251]/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newStaffUserId}
                  className="rounded-full bg-[#A47251] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE BUILDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col border border-[#A47251]/20">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#F0D8A1] border-b border-[#A47251]/10">
              <h3 className="font-serif text-xl font-bold text-[#2A1E17]">
                {editingRole ? `Edit Role: ${editingRole.name}` : "Create Custom Role"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#2A1E17]/60 hover:text-[#2A1E17] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingRole?.isSystemRole}
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Senior Pastry Supervisor"
                    className="w-full rounded-xl border border-[#A47251]/20 bg-white px-4 py-2.5 text-sm text-[#2A1E17] placeholder:text-[#2A1E17]/40 focus:border-[#DD9E59] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70 mb-1">
                    Role Description
                  </label>
                  <input
                    type="text"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="Brief summary of duties and granted access"
                    className="w-full rounded-xl border border-[#A47251]/20 bg-white px-4 py-2.5 text-sm text-[#2A1E17] placeholder:text-[#2A1E17]/40 focus:border-[#DD9E59] focus:outline-none"
                  />
                </div>
              </div>

              {/* Permissions Checklist Grouped by Category */}
              <div className="space-y-4 pt-4 border-t border-[#A47251]/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                    Granular System Permissions ({selectedPermissions.length} selected)
                  </span>
                </div>

                <div className="space-y-6">
                  {categoriesList.map((category) => {
                    const categoryPermissions = ALL_PERMISSIONS.filter((p) => p.category === category);
                    const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p.key));

                    return (
                      <div key={category} className="rounded-xl border border-[#A47251]/10 bg-[#FDF9F0] p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-[#A47251]/10 pb-2">
                          <span className="font-serif text-sm font-bold text-[#2A1E17]">{category}</span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllCategoryPermissions(category)}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#DD9E59] hover:underline cursor-pointer"
                          >
                            {allSelected ? "Deselect All" : "Select All"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {categoryPermissions.map((perm) => {
                            const isChecked = selectedPermissions.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start space-x-3 rounded-lg p-2.5 border transition-all cursor-pointer ${
                                  isChecked
                                    ? "bg-white border-[#DD9E59] shadow-2xs"
                                    : "bg-white/50 border-[#A47251]/10 hover:bg-white"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5 rounded text-[#DD9E59] focus:ring-[#DD9E59]"
                                />
                                <div>
                                  <span className="block text-xs font-bold text-[#2A1E17]">{perm.label}</span>
                                  <span className="block text-[10px] text-[#2A1E17]/60 leading-normal">{perm.description}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#A47251]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70 hover:bg-[#A47251]/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#A47251] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
