import { cache } from "react";
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, query, limit } from "firebase/firestore";
import { db } from "./firebase";
import { Role, SYSTEM_ROLES, PermissionKey } from "@/types/roles";
import { UserProfile } from "@/types/database";

function serializeTimestamp(ts: any): any {
  if (!ts) return null;
  if (typeof ts.toDate === "function") {
    return ts.toDate().toISOString();
  }
  if (typeof ts === "string") return ts;
  if (typeof ts.seconds === "number") {
    return new Date(ts.seconds * 1000).toISOString();
  }
  return null;
}

/**
 * Fetch all roles from Firestore `/roles`, combining system roles with custom roles.
 */
export const getAllRoles = cache(async function getAllRoles(): Promise<Role[]> {
  try {
    const rolesRef = collection(db, "roles");
    const snapshot = await getDocs(rolesRef);
    const customRoles: Role[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      customRoles.push({
        id: docSnap.id,
        name: data.name,
        description: data.description || "",
        permissions: data.permissions || [],
        isSystemRole: data.isSystemRole || false,
        createdAt: serializeTimestamp(data.createdAt),
        updatedAt: serializeTimestamp(data.updatedAt),
      });
    });

    // Merge system roles with custom roles from database (overriding if custom exists)
    const map = new Map<string, Role>();
    SYSTEM_ROLES.forEach((sr) => map.set(sr.id, sr));
    customRoles.forEach((cr) => map.set(cr.id, cr));

    return JSON.parse(JSON.stringify(Array.from(map.values())));
  } catch (error) {
    console.error("Error fetching roles from Firestore:", error);
    return JSON.parse(JSON.stringify(SYSTEM_ROLES));
  }
});

/**
 * Fetch a single role by ID.
 */
export const getRoleById = cache(async function getRoleById(roleId: string): Promise<Role | null> {
  const allRoles = await getAllRoles();
  const found = allRoles.find((r) => r.id === roleId || r.name.toLowerCase() === roleId.toLowerCase());
  return found ? JSON.parse(JSON.stringify(found)) : null;
});

/**
 * Save or update a role document in Firestore.
 */
export async function saveRole(role: Role): Promise<boolean> {
  try {
    const roleRef = doc(db, "roles", role.id);
    const payload = {
      ...role,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(roleRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.error(`Error saving role ${role.id}:`, error);
    return false;
  }
}

/**
 * Delete a custom role from Firestore (System roles cannot be deleted).
 */
export async function deleteRole(roleId: string): Promise<boolean> {
  try {
    const roleRef = doc(db, "roles", roleId);
    await deleteDoc(roleRef);
    return true;
  } catch (error) {
    console.error(`Error deleting role ${roleId}:`, error);
    return false;
  }
}

/**
 * Fetch all registered staff user profiles from Firestore `/users`.
 */
export const getAllUsers = cache(async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const list: UserProfile[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        uid: docSnap.id,
        email: data.email || "",
        displayName: data.displayName || "",
        role: data.role || "customer",
        shippingAddresses: data.shippingAddresses || [],
        createdAt: serializeTimestamp(data.createdAt),
        updatedAt: serializeTimestamp(data.updatedAt),
      } as any);
    });

    return JSON.parse(JSON.stringify(list));
  } catch (error) {
    console.error("Error fetching users from Firestore:", error);
    return [];
  }
});

/**
 * Assign a specific role to a user profile in Firestore.
 */
export async function assignUserRole(userId: string, roleId: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: roleId,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error(`Error assigning role ${roleId} to user ${userId}:`, error);
    return false;
  }
}

/**
 * Check if a user's role grants a specific permission.
 */
export function hasPermission(
  userRole: string | undefined,
  allRoles: Role[],
  permissionKey: PermissionKey
): boolean {
  if (!userRole) return false;

  // Standard legacy super-admin check
  if (userRole === "admin" || userRole === "Super Admin" || userRole === "super-admin") {
    return true;
  }

  // Find user's assigned role
  const roleObj = allRoles.find(
    (r) => r.id === userRole || r.name.toLowerCase() === userRole.toLowerCase()
  );

  if (!roleObj) return false;

  // Super admin role gets all permissions
  if (roleObj.id === "super-admin") return true;

  return roleObj.permissions.includes(permissionKey);
}
