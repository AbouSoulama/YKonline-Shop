import { chromium } from "playwright";
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from "fs";
import { createServer, type Server } from "http";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";
import { getPrerenderRoutes } from "./prerender-routes";

const PRERENDER_READY_EVENT = "yk-prerender-ready";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const PORT = 45678;

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
};

function startStaticServer(): Promise<Server> {
  const server = createServer((req, res) => {
    const urlPath = (req.url ?? "/").split("?")[0];
    let filePath = join(DIST, urlPath === "/" ? "index.html" : urlPath);

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(DIST, "index.html");
    }

    const type = MIME[extname(filePath)] ?? "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server));
  });
}

function outputPath(route: string): string {
  if (route === "/") return join(DIST, "index.html");
  return join(DIST, route.slice(1), "index.html");
}

async function waitForPrerender(page: import("playwright").Page) {
  await page.evaluate(
    `new Promise((resolve) => {
      const finish = () => resolve();
      document.addEventListener("${PRERENDER_READY_EVENT}", finish, { once: true });
      setTimeout(finish, 12000);
    })`,
  );
}

async function prerender() {
  if (process.env.PRERENDER === "false") {
    console.log("Prerender skipped (PRERENDER=false).");
    return;
  }

  if (!existsSync(join(DIST, "index.html"))) {
    throw new Error("dist/index.html not found. Run vite build first.");
  }

  const routes = getPrerenderRoutes();
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Prerendering ${routes.length} routes...`);

  for (const route of routes) {
    const url = `http://127.0.0.1:${PORT}${route}`;
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await waitForPrerender(page);

    const html = await page.content();
    const out = outputPath(route);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, html, "utf-8");
    console.log(`  ✓ ${route}`);
  }

  await browser.close();
  server.close();

  writeSitemap(routes);
  console.log("Prerender complete.");
}

function writeSitemap(routes: string[]) {
  const siteUrl = process.env.VITE_SITE_URL || "https://ykonline.shop";
  const urls = routes
    .map(
      (route) =>
        `  <url><loc>${siteUrl}${route === "/" ? "" : route}</loc><changefreq>weekly</changefreq></url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  writeFileSync(join(DIST, "sitemap.xml"), xml, "utf-8");
  console.log(`  ✓ sitemap.xml (${routes.length} URLs)`);
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
