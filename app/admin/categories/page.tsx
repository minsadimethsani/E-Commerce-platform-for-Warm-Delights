import { getAllCategories } from "@/lib/categories";
import { getAllBadges } from "@/lib/badges";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();
  const badges = await getAllBadges();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2A1E17] tracking-tight">Categories & Tags Manager</h1>
        <p className="mt-1 text-sm text-[#3A2E2B]/70">
          Structure product taxonomy, add custom subcategories, and define promotional badges.
        </p>
      </div>

      <CategoriesClient initialCategories={categories} initialBadges={badges} />
    </div>
  );
}
