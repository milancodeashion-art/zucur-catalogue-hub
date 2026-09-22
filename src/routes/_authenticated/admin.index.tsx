import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ClipboardList, MessageCircle, Package, Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  staticData: { sitemap: false },
  component: AdminDashboard,
});

async function countOf(table: "products" | "visitors" | "whatsapp_enquiries" | "bulk_order_inquiries") {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

function AdminDashboard() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, visitors, whatsapp, bulk] = await Promise.all([
        countOf("products"),
        countOf("visitors"),
        countOf("whatsapp_enquiries"),
        countOf("bulk_order_inquiries"),
      ]);
      const { count: stockOut, error } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("stock_status", "stock_out");
      if (error) throw error;
      return { products, visitors, whatsapp, bulk, stockOut: stockOut ?? 0 };
    },
  });

  const recent = useQuery({
    queryKey: ["admin-recent-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bulk_order_inquiries")
        .select("id, product_name, customer_name, company_name, required_quantity, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const cards = [
    { label: "Total Products", value: stats.data?.products, icon: Package },
    { label: "Stock Out", value: stats.data?.stockOut, icon: AlertTriangle },
    { label: "Visitors", value: stats.data?.visitors, icon: Users },
    { label: "WhatsApp Enquiries", value: stats.data?.whatsapp, icon: MessageCircle },
    { label: "Bulk Inquiries", value: stats.data?.bulk, icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Catalogue and enquiry activity at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {card.label}
              </p>
              <card.icon className="size-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-2xl font-extrabold text-navy">
              {card.value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-base font-bold text-navy">Latest bulk inquiries</h2>
          <Link to="/admin/inquiries" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.data?.length ? (
            recent.data.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm">
                <span className="font-medium text-navy">{row.product_name}</span>
                <span className="text-muted-foreground">· {row.required_quantity} units</span>
                <span className="text-muted-foreground">
                  · {row.customer_name}
                  {row.company_name ? ` (${row.company_name})` : ""}
                </span>
                <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-navy">
                  {row.status}
                </span>
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-muted-foreground">No inquiries yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
