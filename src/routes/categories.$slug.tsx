import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { categoriesQuery, productsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/categories/$slug")({
  head: () => ({
    meta: [
      { title: "Category — Wholesale Products | ZUCUR MART" },
      {
        name: "description",
        content:
          "Wholesale products in this category with SKU, price, minimum order quantity and stock availability.",
      },
      { property: "og:title", content: "Wholesale Category — ZUCUR MART" },
      {
        property: "og:description",
        content: "Bulk-rate products with MOQ and availability at ZUCUR MART.",
      },
    ],
  }),
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
      <div className="mx-auto max-w-7xl px-4 py-12">
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
