import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/whatsapp")({
  component: AdminWhatsapp,
});

function AdminWhatsapp() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-whatsapp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_enquiries")
        .select(
          "id, enquiry_type, created_at, visitors(name, phone), products(name, sku)",
        )
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy">WhatsApp enquiry log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every "Enquire on WhatsApp" and "Ask When Available" click.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Visitor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : data?.length ? (
              data.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{row.enquiry_type}</td>
                  <td className="px-4 py-3 font-medium text-navy">{row.products?.name ?? "General"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.products?.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.visitors ? `${row.visitors.name} · ${row.visitors.phone}` : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  No WhatsApp enquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
