import { useQuery } from "@tanstack/react-query";
import { MessageCircle, BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import { settingsQuery, type Product } from "@/lib/catalog";
import { useVisitor } from "@/lib/visitor";
import { logWhatsappEnquiry, whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function WhatsappEnquiryButton({
  product = null,
  className,
  size = "default",
  variant = "default",
  label,
}: {
  product?: Product | null;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
  label?: string;
}) {
  const { data: settings } = useQuery(settingsQuery);
  const { visitor } = useVisitor();
  const stockOut = product?.stock_status === "stock_out";

  function handleClick() {
    void logWhatsappEnquiry({
      visitorId: visitor?.id ?? null,
      productId: product?.id ?? null,
      enquiryType: product ? (stockOut ? "stock_alert" : "product") : "general",
    });
    window.open(whatsappUrl(settings ?? null, product, visitor), "_blank", "noopener,noreferrer");
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={handleClick}
      className={cn(
        variant === "default" && "bg-success text-success-foreground hover:bg-success/90",
        className,
      )}
    >
      {stockOut ? <BellRing className="size-4" /> : <MessageCircle className="size-4" />}
      {label ?? (stockOut ? "Ask When Available" : "Enquire on WhatsApp")}
    </Button>
  );
}
