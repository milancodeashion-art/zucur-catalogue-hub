import { formatPrice, hasDiscount, type Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface PriceTagProps {
  product: Pick<Product, "price" | "discounted_price">;
  currency?: string;
  size?: "sm" | "lg";
  className?: string;
}

export function PriceTag({ product, currency = "INR", size = "sm", className }: PriceTagProps) {
  const discounted = hasDiscount(product);
  const main = discounted ? product.discounted_price : product.price;

  return (
    <span className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-display font-extrabold",
          size === "lg" ? "text-3xl" : "text-lg",
          discounted ? "text-success" : "text-navy",
        )}
      >
        {formatPrice(main ?? null, currency)}
      </span>
      {discounted ? (
        <>
          <span
            className={cn("text-muted-foreground line-through", size === "lg" ? "text-base" : "text-sm")}
          >
            {formatPrice(product.price, currency)}
          </span>
          <span className="rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-foreground">
            Offer
          </span>
        </>
      ) : null}
    </span>
  );
}
