export type PermissionKey =
  | "dashboard.view"
  | "orders.view"
  | "orders.manage"
  | "products.view"
  | "products.manage"
  | "addons.view"
  | "addons.manage"
  | "categories.view"
  | "categories.manage"
  | "reviews.view"
  | "reviews.manage"
  | "reels.view"
  | "reels.manage"
  | "roles.manage";

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  category: "Analytics" | "Orders" | "Catalog" | "Modifiers" | "Categories" | "Reviews" | "Media" | "Security";
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  { key: "dashboard.view", label: "View Analytics Dashboard", category: "Analytics", description: "Access real-time sales revenue, KPI statistics, and bakery analytics" },
  { key: "orders.view", label: "View Order Queue", category: "Orders", description: "Monitor customer purchases and delivery addresses" },
  { key: "orders.manage", label: "Manage & Dispatch Orders", category: "Orders", description: "Update order fulfillment status (baking, dispatched, delivered, cancelled)" },
  { key: "products.view", label: "View Products", category: "Catalog", description: "Browse active product catalog items and details" },
  { key: "products.manage", label: "Manage Products", category: "Catalog", description: "Create, update, upload media, or delete catalog products" },
  { key: "addons.view", label: "View Add-Ons", category: "Modifiers", description: "View optional item modifiers and fee listings" },
  { key: "addons.manage", label: "Manage Add-Ons", category: "Modifiers", description: "Create, edit, or delete optional add-on modifiers" },
  { key: "categories.view", label: "View Categories & Badges", category: "Categories", description: "View product categories, subcategories, and promo badges" },
  { key: "categories.manage", label: "Manage Categories & Badges", category: "Categories", description: "Create, edit, or remove product categories, subcategories, and badges" },
  { key: "reviews.view", label: "View Customer Reviews", category: "Reviews", description: "Read customer feedback and star ratings" },
  { key: "reviews.manage", label: "Moderate Reviews", category: "Reviews", description: "Approve, moderate, or remove customer reviews" },
  { key: "reels.view", label: "View Video Reels", category: "Media", description: "Watch vertical hero video reels" },
  { key: "reels.manage", label: "Manage Video Reels", category: "Media", description: "Upload, compress, and delete video reels" },
  { key: "roles.manage", label: "Manage Staff Roles & Access Control", category: "Security", description: "Create custom roles, modify permissions, and assign staff roles" },
];

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  isSystemRole?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const SYSTEM_ROLES: Role[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Full, unrestricted access across all portal operations, security configurations, and user management.",
    permissions: ALL_PERMISSIONS.map((p) => p.key),
    isSystemRole: true,
  },
  {
    id: "store-manager",
    name: "Store Manager",
    description: "Manages catalog, active order dispatching, reviews, add-ons, and categories.",
    permissions: [
      "dashboard.view",
      "orders.view",
      "orders.manage",
      "products.view",
      "products.manage",
      "addons.view",
      "addons.manage",
      "categories.view",
      "categories.manage",
      "reviews.view",
      "reviews.manage",
      "reels.view",
      "reels.manage",
    ],
    isSystemRole: true,
  },
  {
    id: "bakery-staff",
    name: "Bakery Staff",
    description: "Monitors incoming order queues and updates baking/delivery progress.",
    permissions: ["dashboard.view", "orders.view", "orders.manage", "products.view"],
    isSystemRole: true,
  },
  {
    id: "content-creator",
    name: "Content Creator",
    description: "Uploads hero reel video clips, reviews customer feedback, and updates product imagery.",
    permissions: ["products.view", "reviews.view", "reviews.manage", "reels.view", "reels.manage"],
    isSystemRole: true,
  },
];
