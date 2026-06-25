import { products } from "../src/data/products";

const STATIC_ROUTES = [
  "/",
  "/shop",
  "/about",
  "/routines",
  "/blog",
  "/faq",
  "/contact",
  "/track-order",
  "/shipping",
  "/legal",
  "/terms",
  "/privacy",
  "/cookies",
];

const BLOG_SLUGS = [
  "benefits-organic-shea-butter-skin",
  "raw-shea-vs-refined-shea",
  "shea-butter-hair-tips",
  "guide-choosing-shea-butter",
  "shea-butter-dry-skin",
  "integrating-shea-beauty-routine",
];

export function getPrerenderRoutes(): string[] {
  const productRoutes = products.map((p) => `/product/${p.id}`);
  const blogRoutes = BLOG_SLUGS.map((s) => `/blog/${s}`);
  return [...new Set([...STATIC_ROUTES, ...productRoutes, ...blogRoutes])];
}
