import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ImageOff, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MoqBadge, StockBadge } from "@/components/site/badges";
import { ProductCard } from "@/components/site/ProductCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import { WhatsappEnquiryButton } from "@/components/site/WhatsappEnquiryButton";
import { formatPrice, productQuery, productsQuery, settingsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/products/$slug")({
  head: () => ({
    meta: [
      { title: "Wholesale Product Details — ZUCUR MART" },
      {
        name: "description",
        content:
          "Product specifications, SKU, wholesale price, minimum order quantity and availability. Enquire on WhatsApp or raise a bulk order inquiry.",
      },
      { property: "og:title", content: "Wholesale Product Details — ZUCUR MART" },
      {
        property: "og:description",
        content: "SKU, wholesale price, MOQ and availability for bulk buyers.",
      },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery(productQuery(slug));
  const { data: settings } = useQuery(settingsQuery);
  const { data: allProducts = [] } = useQuery(productsQuery);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-20 text-sm text-muted-foreground">
          Loading product…
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-extrabold text-navy">Product not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This listing may have been removed from the wholesale catalogue.
          </p>
          <Button asChild className="mt-6">
            <Link to="/products">Back to catalogue</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const related = allProducts
    .filter((item) => item.category_id === product.category_id && item.id !== product.id)
    .slice(0, 4);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to all products
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              {images[activeImage] ? (
                <img
                  src={images[activeImage].image_url}
                  alt={product.name}
                  className="aspect-4/3 w-full object-cover"
                />
              ) : (
                <div className="grid aspect-4/3 w-full place-items-center bg-secondary text-muted-foreground">
                  <ImageOff className="size-10" />
                </div>
              )}
            </div>
            {images.length > 1 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.image_url + index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`size-16 overflow-hidden rounded-md border ${
                      index === activeImage ? "border-primary ring-2 ring-primary/30" : "border-border"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img src={image.image_url} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            {product.category ? (
              <Link
                to="/categories/$slug"
                params={{ slug: product.category.slug }}
                className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            ) : null}
            <h1 className="mt-2 font-display text-2xl font-extrabold text-navy sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">SKU: {product.sku}</p>

            <p className="mt-5 font-display text-3xl font-extrabold text-navy">
              {formatPrice(product.price, settings?.currency ?? "INR")}
              <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                per unit · wholesale
              </span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <MoqBadge moq={product.moq} />
              <StockBadge status={product.stock_status} />
            </div>

            {product.stock_status === "stock_out" ? (
              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                This item is currently out of stock. Ask us when it will be available and we will
                confirm the next dispatch batch.
              </div>
            ) : null}

            {product.description ? (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            ) : null}

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <WhatsappEnquiryButton product={product} size="lg" />
              <Button asChild size="lg" variant="outline">
                <Link to="/bulk-order-inquiry" search={{ product: product.slug }}>
                  Bulk Order Inquiry
                </Link>
              </Button>
            </div>

            <ul className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <li className="flex gap-2">
                <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
                Pan-India dispatch on confirmed quotations
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                GST invoice with every wholesale order
              </li>
            </ul>

            {product.specifications ? (
              <div className="mt-8 rounded-lg border border-border bg-card p-5">
                <h2 className="font-display text-base font-bold text-navy">Specifications</h2>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  {product.specifications.split("|").map((line) => (
                    <li key={line} className="border-b border-border pb-2 last:border-0 last:pb-0">
                      {line.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-14">
            <h2 className="font-display text-xl font-extrabold text-navy">
              More from {product.category?.name ?? "this category"}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </SiteLayout>
  );
}
