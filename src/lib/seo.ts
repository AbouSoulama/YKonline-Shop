import { useEffect } from "react";
import { SITE_URL } from "./siteUrl";

export interface PageMeta {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "YKonline Shop - Natural Organic Premium Shea Butter | USA";
const DEFAULT_DESCRIPTION =
  "YKonline Shop — Premium organic shea butter shipped across the United States. Based in Maryland, USA. 100% natural skin and hair care with fast US delivery.";
const DEFAULT_IMAGE =
  "https://sori-mobile-tire.com/wp-content/uploads/2026/06/YKONLINE-SHOP-LOGO.jpeg";

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

export function applyPageMeta(meta: PageMeta) {
  const title = meta.title.includes("YKonline") ? meta.title : `${meta.title} | YKonline Shop`;
  const description = meta.description ?? DEFAULT_DESCRIPTION;
  const url = meta.path ? `${SITE_URL}${meta.path}` : SITE_URL;
  const image = meta.image ?? DEFAULT_IMAGE;

  document.title = title;
  setMetaTag("name", "description", description);
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("property", "og:url", url);
  setMetaTag("property", "og:image", image);
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", image);
  setMetaTag("property", "og:locale", "en_US");
  setMetaTag("name", "geo.region", "US-MD");
  setMetaTag("name", "geo.placename", "Waldorf, Maryland, United States");
  setCanonical(url);

  if (meta.noIndex) {
    setMetaTag("name", "robots", "noindex, nofollow");
  } else {
    setMetaTag("name", "robots", "index, follow");
  }
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    applyPageMeta(meta);
    return () => applyPageMeta({ title: "YKonline Shop", description: DEFAULT_DESCRIPTION });
  }, [meta.title, meta.description, meta.path, meta.image, meta.noIndex]);
}

export const SEO_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/shop", priority: "0.9", changefreq: "daily" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/routines", priority: "0.7", changefreq: "monthly" },
  { path: "/blog", priority: "0.8", changefreq: "weekly" },
  { path: "/faq", priority: "0.6", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/track-order", priority: "0.5", changefreq: "monthly" },
  { path: "/shipping", priority: "0.5", changefreq: "monthly" },
  { path: "/legal", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/cookies", priority: "0.3", changefreq: "yearly" },
] as const;
