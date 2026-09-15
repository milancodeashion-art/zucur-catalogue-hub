import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type StockStatus = "available" | "stock_out";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  display_order: number;
  active: boolean;
}

export interface ProductImage {
  image_url: string;
  display_order: number;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  specifications: string | null;
  price: number | null;
  discounted_price: number | null;
  moq: number;
  stock_status: StockStatus;
  featured: boolean;
  active: boolean;
  created_at: string;
  category: { name: string; slug: string } | null;
  product_images: ProductImage[];
}

export interface SiteSettings {
  id: string;
  business_name: string;
  whatsapp_number: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  business_hours: string | null;
  default_whatsapp_message: string | null;
  currency: string;
}

const PRODUCT_SELECT =
  "id, category_id, name, slug, sku, description, specifications, price, discounted_price, moq, stock_status, featured, active, created_at, category:categories(name, slug), product_images(image_url, display_order)";

function unwrap<T>(data: unknown): T {
  return data as T;
}

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image, display_order, active")
      .eq("active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return unwrap<Category[]>(data ?? []);
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return unwrap<Product[]>(data ?? []);
  },
});

export function productQuery(slug: string) {
  return queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();
      if (error) throw error;
      return data ? unwrap<Product>(data) : null;
    },
  });
}

export const settingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: async (): Promise<SiteSettings | null> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "id, business_name, whatsapp_number, email, phone, address, business_hours, default_whatsapp_message, currency",
      )
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? unwrap<SiteSettings>(data) : null;
  },
});

export function productImage(product: Pick<Product, "product_images">): string | null {
  const sorted = [...(product.product_images ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  );
  return sorted[0]?.image_url ?? null;
}

export function formatPrice(price: number | null, currency = "INR"): string {
  if (price === null || price === undefined) return "Price on request";
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${Number(price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
