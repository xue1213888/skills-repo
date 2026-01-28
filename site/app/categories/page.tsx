import type { Metadata } from "next";
import { CategoriesPageClient } from "./CategoriesPageClient";
import { loadRegistryCategories, loadRegistryIndex } from "@/lib/registry";
import { LOCALE_OPTIONS, DEFAULT_LOCALE } from "@/lib/i18n";

export const dynamic = "error";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse skills organized by categories including Development, Design, DevOps, Documentation, and more.",
  alternates: {
    canonical: "/categories",
    languages: Object.fromEntries(
      LOCALE_OPTIONS.map(opt => [
        opt.locale,
        opt.locale === DEFAULT_LOCALE ? '/categories' : `/${opt.locale}/categories`
      ])
    )
  }
};

export default async function CategoriesPage() {
  const cats = await loadRegistryCategories();
  const index = await loadRegistryIndex();

  // v2: flat categories (no subcategories)
  const counts: Record<string, number> = {};
  for (const s of index.skills) {
    counts[s.category] = (counts[s.category] ?? 0) + 1;
  }

  return <CategoriesPageClient cats={cats} counts={counts} />;
}
