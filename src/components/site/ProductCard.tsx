import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { productImage, settingsQuery, type Product } from "@/lib/catalog";

import { MoqBadge, StockBadge } from "./badges";
import { PriceTag } from "./PriceTag";
import { WhatsappEnquiryButton } from "./WhatsappEnquiryButton";

export function ProductCard({ product }: { product: Product }) {
  const { data: settings } = useQuery(settingsQuery);
  const image = productImage(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-4/3 overflow-hidden bg-secondary"
      >
        {image ? (
          <img
            src={image}
            alt={`${product.name} — wholesale ${product.category?.name ?? "product"} from Zucur Mart`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-8" />
          </span>
        )}
        {product.featured ? (
          <span className="absolute left-2 top-2 rounded bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-foreground">
            Best sellers
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          {product.category?.name ?? "Wholesale"}
        </p>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="font-display text-sm font-bold leading-snug text-navy hover:text-primary sm:text-base"
        >
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
        <PriceTag product={product} currency={settings?.currency ?? "INR"} className="mt-auto" />
        <div className="flex flex-wrap gap-1.5">
          <MoqBadge moq={product.moq} />
          <StockBadge status={product.stock_status} />
        </div>
        <div className="mt-3 grid gap-2">
          <WhatsappEnquiryButton product={product} size="sm" />
          <Button asChild size="sm" variant="outline">
            <Link
              to="/bulk-order-inquiry"
              search={{ product: product.slug }}
              className="w-full justify-center"
            >
              Bulk Order Inquiry
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
