import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const SITE_URL = (process.env.PUBLIC_SITE_URL || process.env.SITE_URL || "https://plannr.in").replace(/\/+$/, "");

// Public, indexable routes only. Keep this aligned with the marketing pages
// that should be discoverable by search engines.
const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/examples",
  "/docs",
  "/terms",
  "/privacy",
  "/cookies",
  "/contact",
  "/refund",
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemapXml() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC_ROUTES.map((route) => {
    const loc = `${SITE_URL}${route === "/" ? "/" : route}`;
    return [
      "  <url>",
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      "  </url>",
    ].join("\n");
  }).join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

function buildRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });

  await Promise.all([
    writeFile(path.join(PUBLIC_DIR, "sitemap.xml"), buildSitemapXml(), "utf8"),
    writeFile(path.join(PUBLIC_DIR, "robots.txt"), buildRobotsTxt(), "utf8"),
  ]);

  console.log(`[seo] Generated sitemap and robots.txt in ${path.relative(ROOT, PUBLIC_DIR)}`);
}

main().catch((error) => {
  console.error("[seo] Failed to generate SEO assets");
  console.error(error);
  process.exitCode = 1;
});
