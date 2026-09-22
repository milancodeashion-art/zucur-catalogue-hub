import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductCard } from "@/components/site/ProductCard";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import { breadcrumbSchema, seoHead } from "@/lib/seo";
import { imageSrc } from "@/lib/upload";

export const Route = createFileRoute("/categories/$slug")({
  staticData: { sitemap: true },
  loader: async ({ params, context }) => {
    const categories = await context.queryClient.ensureQueryData(categoriesQuery);
    return { category: categories.find((item) => item.slug === params.slug) ?? null };
  },
  head: ({ params, loaderData }) => {
    const path = `/categories/${params.slug}`;
    const category = loaderData?.category ?? null;

    if (!category) {
      return seoHead({
        title: "Category not available | Zucur Mart",
        description: "This wholesale category is no longer listed in the Zucur Mart catalogue.",
        path,
        noindex: true,
      });
    }

    const description =
      category.description ??
      `${category.name} at wholesale rates from Zucur Mart, a B2B wholesale supplier in Yogichowk, Surat. Compare SKUs, wholesale prices, minimum order quantities and stock availability for bulk orders.`;

    const base = seoHead({
      title: `${category.name} | Zucur Mart Wholesale`,
      description,
      path,
      image: imageSrc(category.image),
    });

    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Categories", path: "/categories" },
              { name: category.name, path },
            ]),
          ),
        },
      ],
    };
  },
  component: CategoryDetailPage,
});

function CategoryDetailPage() {
  const { slug } = Route.useParams();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: products = [], isLoading } = useQuery(productsQuery);

  const category = categories.find((c) => c.slug === slug);
  const items = category ? products.filter((p) => p.category_id === category.id) : [];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Category"
        title={category?.name ?? "Category"}
        subtitle={category?.description ?? undefined}
      />
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <Breadcrumbs
          items={[
            { name: "Home", to: "/" },
            { name: "Categories", to: "/categories" },
            { name: category?.name ?? "Category" },
          ]}
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading products…</p>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="font-display text-lg font-bold text-navy">No products listed yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us what you need and we will source it for your volume.
            </p>
            <Button asChild className="mt-5">
              <Link to="/bulk-order-inquiry">Send a bulk inquiry</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
