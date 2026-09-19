import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { categoriesQuery, productsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Wholesale Categories — ZUCUR MART" },
      {
        name: "description",
        content:
          "Explore ZUCUR MART wholesale categories: packaging, cleaning and hygiene, disposables, office stationery, kitchenware and personal care.",
      },
      { property: "og:title", content: "Wholesale Categories — ZUCUR MART" },
      {
        property: "og:description",
        content: "Browse bulk supply categories with MOQ and wholesale rates.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery(categoriesQuery);
  const { data: products = [] } = useQuery(productsQuery);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Catalogue"
        title="Wholesale categories"
        subtitle="Every category is stocked for bulk supply with published minimum order quantities."
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading categories…</p> : null}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const count = products.filter((p) => p.category_id === category.id).length;
            return (
              <Link
                key={category.id}
                to="/categories/$slug"
                params={{ slug: category.slug }}
                className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                {category.image ? (
                  <img
                    src={imageSrc(category.image) ?? ""}
                    alt={category.name}
                    loading="lazy"
                    className="aspect-16/9 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : null}
                <div className="p-5">
                  <h2 className="font-display text-lg font-bold text-navy group-hover:text-primary">
                    {category.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {count} products <ArrowRight className="size-4" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
