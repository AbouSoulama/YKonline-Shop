import { existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getPrerenderRoutes } from "./prerender-routes";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");

export function writeSitemap(routes: string[], distDir = DIST) {
  const siteUrl = process.env.VITE_SITE_URL || "https://ykonline.shop";
  const urls = routes
    .map(
      (route) =>
        `  <url><loc>${siteUrl}${route === "/" ? "" : route}</loc><changefreq>weekly</changefreq></url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  writeFileSync(join(distDir, "sitemap.xml"), xml, "utf-8");
  console.log(`Sitemap generated (${routes.length} URLs).`);
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  if (!existsSync(join(DIST, "index.html"))) {
    console.error("dist/index.html not found. Run vite build first.");
    process.exit(1);
  }
  writeSitemap(getPrerenderRoutes());
}
