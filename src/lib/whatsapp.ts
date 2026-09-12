import { supabase } from "@/integrations/supabase/client";

import { formatPrice, type Product, type SiteSettings } from "./catalog";
import type { VisitorRecord } from "./visitor";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function buildEnquiryMessage(
  settings: SiteSettings | null,
  product: Product | null,
  visitor: VisitorRecord | null,
): string {
  const lines: string[] = [];
  const business = settings?.business_name ?? "ZUCUR MART";

  if (product) {
    const stockOut = product.stock_status === "stock_out";
    lines.push(
      stockOut
        ? `Hello ${business}, I would like to know when this product will be available again.`
        : `Hello ${business}, I would like a wholesale quotation for the product below.`,
    );
    lines.push("");
    lines.push("*Product Details*");
    lines.push(`Name: ${product.name}`);
    lines.push(`SKU: ${product.sku}`);
    if (product.category?.name) lines.push(`Category: ${product.category.name}`);
    lines.push(`Price: ${formatPrice(product.price, settings?.currency ?? "INR")}`);
    lines.push(`MOQ: ${product.moq} Units`);
    lines.push(`Availability: ${stockOut ? "Stock Out" : "Available"}`);
    if (stockOut) {
      lines.push("");
      lines.push("Please notify me as soon as fresh stock arrives.");
    }
  } else {
    lines.push(
      settings?.default_whatsapp_message?.trim() ||
        `Hello ${business}, I would like to enquire about wholesale pricing.`,
    );
  }

  if (visitor) {
    lines.push("");
    lines.push("*My Details*");
    lines.push(`Name: ${visitor.name}`);
    lines.push(`Phone: ${visitor.phone}`);
    if (visitor.email) lines.push(`Email: ${visitor.email}`);
  }

  return lines.join("\n").slice(0, 1500);
}

export function whatsappUrl(
  settings: SiteSettings | null,
  product: Product | null,
  visitor: VisitorRecord | null,
): string {
  const number = digitsOnly(settings?.whatsapp_number ?? "919000000000");
  const text = encodeURIComponent(buildEnquiryMessage(settings, product, visitor));
  return `https://wa.me/${number}?text=${text}`;
}

export async function logWhatsappEnquiry(params: {
  visitorId: string | null;
  productId: string | null;
  enquiryType: "product" | "stock_alert" | "general";
}): Promise<void> {
  const { error } = await supabase.from("whatsapp_enquiries").insert({
    visitor_id: params.visitorId,
    product_id: params.productId,
    enquiry_type: params.enquiryType,
  });
  if (error) console.error("Failed to log WhatsApp enquiry", error.message);
}
