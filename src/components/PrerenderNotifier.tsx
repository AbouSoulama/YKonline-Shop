import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";

export const PRERENDER_READY_EVENT = "yk-prerender-ready";

export function notifyPrerenderReady() {
  document.dispatchEvent(new Event(PRERENDER_READY_EVENT));
}

/** Signals Puppeteer when the current route has rendered (build-time prerender only). */
export default function PrerenderNotifier() {
  const { pathname } = useLocation();
  const { loading } = useProducts();

  useEffect(() => {
    if (loading) return;

    const isBlogArticle = pathname.startsWith("/blog/") && pathname !== "/blog";
    const delay = isBlogArticle ? 3500 : 800;

    const timer = window.setTimeout(notifyPrerenderReady, delay);
    return () => window.clearTimeout(timer);
  }, [pathname, loading]);

  return null;
}
