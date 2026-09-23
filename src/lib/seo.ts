/**
 * Shared SEO helpers: canonical URLs, per-page metadata and JSON-LD builders.
 * Metadata only — no visual or behavioural changes.
 */

export const SITE_URL = "https://zucur-catalogue-hub.lovable.app";
export const SITE_NAME = "Zucur Mart";
export const GOOGLE_BUSINESS_PROFILE = "https://share.google/DBOMKhPlebvtBCjoF";

export const SOCIAL_PROFILES = [
  "https://t.me/Newindiacart",
  "https://www.instagram.com/zucur.mart?stkn=NXRrbjR0dmxtNTdk",
  "https://youtube.com/@zucurstore?si=CsGQLlbgf_ovwsiy",
];

/** Absolute, self-referencing URL for a route path. */
export function canonicalUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return new URL(clean, SITE_URL).href;
}

export interface SeoInput {
  title: string;
  description: string;
  path: string;
  /** Absolute https image URL only — relative or bundled assets are skipped. */
  image?: string | null;
  type?: "website" | "article" | "product";
  noindex?: boolean;
}

/** Returns the `meta` + `links` head fragment for one page. */
export function seoHead(input: SeoInput) {
  const url = canonicalUrl(input.path);
  const absoluteImage =
    input.image && /^https:\/\//.test(input.image) ? input.image : undefined;

  const meta: Array<Record<string, string>> = [
    { title: input.title },
    { name: "description", content: input.description },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
  ];

  if (absoluteImage) {
    meta.push({ property: "og:image", content: absoluteImage });
    meta.push({ name: "twitter:image", content: absoluteImage });
  }

  if (input.noindex) meta.push({ name: "robots", content: "noindex, nofollow" });

  return { meta, links: [{ rel: "canonical", href: url }] };
}

export interface Crumb {
  name: string;
  path: string;
}

/** BreadcrumbList JSON-LD for the given trail. */
export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  };
}
