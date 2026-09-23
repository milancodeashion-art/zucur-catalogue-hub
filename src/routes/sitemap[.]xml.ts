import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";

import { sitemapPathForLocation, sitemapStaticPaths, sitemapXML, type SitemapEntry } from "@/lib/sitemap";
import { isSitemapRouteIncluded } from "@/lib/sitemap";

const BASE_URL = "https://zucur-catalogue-hub.lovable.app";

const PRODUCT_ROUTE_ID = "/products/$slug";
const CATEGORY_ROUTE_ID = "/categories/$slug";

/** Session-free public client using the publishable key and existing public read policies. */
async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['VITE_SUPABASE_PUBLISHABLE_KEY']!;
  const url = process.env['SUPABASE_URL'] ?? process.env['VITE_SUPABASE_URL']!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === "Bearer " + key) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        const needsProducts = isSitemapRouteIncluded(router.routesById[PRODUCT_ROUTE_ID]);
        const needsCategories = isSitemapRouteIncluded(router.routesById[CATEGORY_ROUTE_ID]);

        if (needsProducts || needsCategories) {
          const supabase = await publicClient();
          const pageSize = 1000;

          if (needsCategories) {
            for (let offset = 0; ; ) {
              const { data, error } = await supabase
                .from("categories")
                .select("slug")
                .eq("active", true)
                .order("slug")
                .range(offset, offset + pageSize - 1);
              if (error) throw new Error(error.message);
              if (!data || data.length === 0) break;
              for (const row of data) {
                const location = router.buildLocation({
                  to: "/categories/$slug",
                  params: { slug: row.slug },
                  search: () => ({}),
                  hash: "",
                });
                const path = sitemapPathForLocation(router, location, CATEGORY_ROUTE_ID);
                if (path) entries.push({ path });
              }
              offset += data.length;
            }
          }

          if (needsProducts) {
            for (let offset = 0; ; ) {
              const { data, error } = await supabase
                .from("products")
                .select("slug")
                .eq("active", true)
                .order("slug")
                .range(offset, offset + pageSize - 1);
              if (error) throw new Error(error.message);
              if (!data || data.length === 0) break;
              for (const row of data) {
                const location = router.buildLocation({
                  to: "/products/$slug",
                  params: { slug: row.slug },
                  search: () => ({}),
                  hash: "",
                });
                const path = sitemapPathForLocation(router, location, PRODUCT_ROUTE_ID);
                if (path) entries.push({ path });
              }
              offset += data.length;
            }
          }
        }

        if (entries.length === 0) {
          return new Response("No pages are included in this sitemap.", {
            status: 404,
            headers: { "Cache-Control": "no-store" },
          });
        }

        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
