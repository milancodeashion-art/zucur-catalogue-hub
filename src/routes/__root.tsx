import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { VisitorProvider } from "@/lib/visitor";
import { supabase } from "@/integrations/supabase/client";
import { GOOGLE_BUSINESS_PROFILE, SITE_URL, SOCIAL_PROFILES } from "@/lib/seo";

const BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": ["WholesaleStore", "LocalBusiness", "Organization"],
  "@id": `${SITE_URL}/#business`,
  name: "Zucur Mart",
  alternateName: ["ZUCUR MART", "ZucurMart", "Zucur"],
  url: SITE_URL,
  email: "info@zucur.com",
  telephone: "+91 6359061362",
  description:
    "Zucur Mart is a B2B wholesale supplier in Yogichowk, Surat, Gujarat offering bulk household, bathroom, kitchen, cleaning, hardware, bags, home decor, stationery and packaging products for retailers, distributors, hotels and institutions.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "38 The Galleria, Near Anupam Business Hub, Yogi Chowk Ground, Chikuwadi, Varachha",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    postalCode: "395011",
    addressCountry: "IN",
  },
  openingHours: "Mo-Sa 09:00-18:00",
  areaServed: "India",
  sameAs: [...SOCIAL_PROFILES, "https://wa.me/919313403837", GOOGLE_BUSINESS_PROFILE],
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "Zucur Mart",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#business` },
  inLanguage: "en-IN",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zucur Mart | B2B Wholesale Supplier in Surat, Gujarat" },
      {
        name: "description",
        content:
          "Zucur Mart is a B2B wholesale supplier in Yogichowk, Surat, Gujarat supplying bulk household, bathroom, kitchen, cleaning, hardware and packaging products to retailers, distributors and businesses.",
      },
      { name: "author", content: "Zucur Mart" },
      { name: "telephone", content: "+91 6359061362" },
      { name: "email", content: "info@zucur.com" },
      { name: "geo.region", content: "IN-GJ" },
      { name: "geo.placename", content: "Surat" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Zucur Mart" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script type="application/ld+json">{JSON.stringify(BUSINESS_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(WEBSITE_SCHEMA)}</script>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <VisitorProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="top-right" richColors />
      </VisitorProvider>
    </QueryClientProvider>
  );
}
