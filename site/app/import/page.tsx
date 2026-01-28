import type { Metadata } from "next";
import { ImportClient } from "./ImportClient";
import { loadRegistryCategories, loadRegistryIndex } from "@/lib/registry";
import { LOCALE_OPTIONS, DEFAULT_LOCALE } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Import Skills",
  description: "Submit your Claude AI skills to the registry. Import skills from GitHub repositories and share them with the community.",
  alternates: {
    canonical: "/import",
    languages: Object.fromEntries(
      LOCALE_OPTIONS.map(opt => [
        opt.locale,
        opt.locale === DEFAULT_LOCALE ? '/import' : `/${opt.locale}/import`
      ])
    )
  }
};

export default async function ImportPage() {
  const [categories, index] = await Promise.all([loadRegistryCategories(), loadRegistryIndex()]);
  return <ImportClient initialCategories={categories} initialRegistryIndex={index} />;
}

