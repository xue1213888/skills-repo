import fs from "node:fs/promises";

import fg from "fast-glob";
import YAML from "yaml";

import { SKILL_YAML_GLOB, buildSearchDocs, loadCategoriesFromRepo, scanSkills, writeJson } from "./lib/registry.mjs";

let generatedAt = new Date().toISOString();

async function backfillSkillTimestamps(now) {
  const skillYamlPaths = await fg([SKILL_YAML_GLOB], { onlyFiles: true, dot: true });
  skillYamlPaths.sort((a, b) => a.localeCompare(b));

  let updated = 0;
  for (const skillYamlPath of skillYamlPaths) {
    const raw = await fs.readFile(skillYamlPath, "utf8");
    const meta = YAML.parse(raw);
    if (!meta || typeof meta !== "object") continue;

    const createdExisting = typeof meta.createdAt === "string" ? meta.createdAt.trim() : "";
    const updatedExisting = typeof meta.updatedAt === "string" ? meta.updatedAt.trim() : "";
    if (createdExisting && updatedExisting) continue;

    const createdAt = createdExisting || now;
    const updatedAt = updatedExisting || now;

    const {
      specVersion,
      id,
      title,
      description,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...rest
    } = meta;

    const next = { specVersion, id, title, description, createdAt, updatedAt, ...rest };
    await fs.writeFile(skillYamlPath, YAML.stringify(next), "utf8");
    updated += 1;
  }

  if (updated > 0) {
    console.log(`Backfilled timestamps: ${updated} skill manifest(s)`);
  }
}

await backfillSkillTimestamps(generatedAt);

let { skills, errors } = await scanSkills({ includeFiles: true, includeSummary: true });
if (errors.length > 0) {
  console.error(errors.join("\n\n"));
  process.exit(1);
}

let categories = await loadCategoriesFromRepo(skills);

let index = {
  specVersion: 1,
  generatedAt,
  skills
};

let categoriesJson = {
  specVersion: 1,
  generatedAt,
  categories
};

let searchIndex = {
  specVersion: 1,
  generatedAt,
  docs: buildSearchDocs(skills)
};

// Canonical build outputs (tooling + CI).
await writeJson("registry/index.json", index);
await writeJson("registry/categories.json", categoriesJson);
await writeJson("registry/search-index.json", searchIndex);

// Site consumes these as static public assets.
await fs.mkdir("site/public/registry", { recursive: true });
await writeJson("site/public/registry/index.json", index);
await writeJson("site/public/registry/categories.json", categoriesJson);
await writeJson("site/public/registry/search-index.json", searchIndex);
try {
  await fs.copyFile("registry/agents.json", "site/public/registry/agents.json");
} catch {
  // Optional file (agent install directory config)
}

// SEO assets (optional; emitted when SITE_URL is configured in CI).
if (process.env.SITE_URL) {
  let base = process.env.SITE_URL.replace(/\/+$/, "");
  let urls = [
    `${base}/`,
    `${base}/categories/`,
    ...categories.flatMap((c) => c.subcategories.map((s) => `${base}/c/${c.id}/${s.id}/`)),
    ...skills.map((s) => `${base}/s/${s.id}/`)
  ];

  let xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((loc) => `  <url><loc>${loc}</loc><lastmod>${generatedAt}</lastmod></url>`)
      .join("\n") +
    `\n</urlset>\n`;

  await fs.mkdir("site/public", { recursive: true });
  await fs.writeFile("site/public/sitemap.xml", xml, "utf8");
  await fs.writeFile("site/public/robots.txt", `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`, "utf8");
}

console.log(`OK: wrote registry (skills=${skills.length})`);
