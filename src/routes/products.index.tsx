import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/site/ProductCard";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { categoriesQuery, productsQuery } from "@/lib/catalog";

interface ProductSearch {
  q?: string;
  category?: string;
}

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    const q = typeof search['q'] === "string" && search['q'].trim() ? search['q'].trim().slice(0, 80) : undefined;
    const category =
      typeof search['category'] === "string" && search['category'].trim()
        ? search['category'].trim().slice(0, 80)
        : undefined;
    return { ...(q ? { q } : {}), ...(category ? { category } : {}) };
  },
  head: () => ({
    meta: [
      { title: "All Wholesale Products — ZUCUR MART" },
      {
        name: "description",
        content:
          "Search the full ZUCUR MART wholesale catalogue. Filter by category and availability, sort by price or newest, and check MOQ on every product.",
      },
      { property: "og:title", content: "All Wholesale Products — ZUCUR MART" },
      {
        property: "og:description",
        content: "Wholesale rates, minimum order quantities and live stock status.",
      },
    ],
  }),
  component: ProductsPage,
});

type SortKey = "newest" | "price-asc" | "price-desc" | "name";

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);

  const [term, setTerm] = useState(search['q'] ?? "");
  const [availability, setAvailability] = useState<"all" | "available" | "stock_out">("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const activeQuery = (search['q'] ?? "").toLowerCase();
  const activeCategory = search['category'] ?? "all";

  const results = useMemo(() => {
    let list = products.filter((product) => {
      if (activeCategory !== "all") {
        const category = categories.find((c) => c.slug === activeCategory);
        if (!category || product.category_id !== category.id) return false;
      }
      if (availability !== "all" && product.stock_status !== availability) return false;
      if (!activeQuery) return true;
      return (
        product.name.toLowerCase().includes(activeQuery) ||
        product.sku.toLowerCase().includes(activeQuery) ||
        (product.description ?? "").toLowerCase().includes(activeQuery)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sort === "price-desc") return (b.price ?? -Infinity) - (a.price ?? -Infinity);
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [products, categories, activeCategory, activeQuery, availability, sort]);

  function applySearch(event: React.FormEvent) {
    event.preventDefault();
    void navigate({
      search: {
        ...(term.trim() ? { q: term.trim() } : {}),
        ...(activeCategory !== "all" ? { category: activeCategory } : {}),
      },
    });
  }

  function setCategory(value: string) {
    void navigate({
      search: {
        ...(search['q'] ? { q: search['q'] } : {}),
        ...(value !== "all" ? { category: value } : {}),
      },
    });
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Wholesale catalogue"
        title="All products"
        subtitle="Wholesale rates with minimum order quantity and live availability on every listing."
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-12">
            <form onSubmit={applySearch} className="lg:col-span-5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search by product name or SKU"
                  className="pl-8"
                  aria-label="Search products"
                />
              </div>
            </form>
            <div className="lg:col-span-3">
              <Select value={activeCategory} onValueChange={setCategory}>
                <SelectTrigger aria-label="Filter by category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Select
                value={availability}
                onValueChange={(value) => setAvailability(value as typeof availability)}
              >
                <SelectTrigger aria-label="Filter by availability">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any availability</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="stock_out">Stock out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
                <SelectTrigger aria-label="Sort products">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {search['q'] ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Showing results for “{search['q']}” ·{" "}
              <Button
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => {
                  setTerm("");
                  void navigate({
                    search: activeCategory !== "all" ? { category: activeCategory } : {},
                  });
                }}
              >
                clear search
              </Button>
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {isLoading ? "Loading products…" : `${results.length} products`}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!isLoading && results.length === 0 ? (
          <div className="mt-6 rounded-lg border border-border bg-card p-8 text-center">
            <p className="font-display text-lg font-bold text-navy">No matching products</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search term, or send us your requirement directly.
            </p>
          </div>
        ) : null}
      </div>
    </SiteLayout>
  );
}
