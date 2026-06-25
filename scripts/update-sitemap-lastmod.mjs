import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");
const TODAY = new Date().toISOString().split("T")[0];

async function main() {
  const sitemap = await readFile(SITEMAP_PATH, "utf8");
  const updated = sitemap.replaceAll(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
    `<lastmod>${TODAY}</lastmod>`,
  );

  if (updated !== sitemap) {
    await writeFile(SITEMAP_PATH, updated, "utf8");
    console.log(`[sitemap] Updated lastmod dates in ${path.relative(ROOT, SITEMAP_PATH)} to ${TODAY}`);
  } else {
    console.log(`[sitemap] No lastmod dates found in ${path.relative(ROOT, SITEMAP_PATH)}`);
  }
}

main().catch((error) => {
  console.error("[sitemap] Failed to update lastmod dates");
  console.error(error);
  process.exitCode = 1;
});
