import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/whatsapp")({
  staticData: { sitemap: false },
  component: AdminWhatsapp,
});

const PAGE_SIZE = 15;

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function AdminWhatsapp() {
  const today = todayISO();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [from, to, sort]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-whatsapp", from, to, sort, page],
    queryFn: async () => {
      const start = new Date(`${from}T00:00:00`);
      const end = new Date(`${to}T23:59:59.999`);
      const offset = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await supabase
        .from("whatsapp_enquiries")
        .select("id, enquiry_type, created_at, visitors(name, phone), products(name, sku)", {
          count: "exact",
        })
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: sort === "oldest" })
        .range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const rows = data?.rows ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy">WhatsApp enquiry log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every "Enquire on WhatsApp" and "Ask When Available" click. Showing today's logs by
          default.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="w-from">From</Label>
          <Input
            id="w-from"
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="w-to">To</Label>
          <Input
            id="w-to"
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="w-sort">Sort by date</Label>
          <select
            id="w-sort"
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value === "oldest" ? "oldest" : "newest")}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setFrom(today);
              setTo(today);
            }}
          >
            Today
          </Button>
        </div>
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
            ) : rows.length ? (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{row.enquiry_type}</td>
                  <td className="px-4 py-3 font-medium text-navy">
                    {row.products?.name ?? "General"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.products?.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.visitors ? `${row.visitors.name} · ${row.visitors.phone}` : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  No WhatsApp enquiries in this date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.count ?? 0}
        onPageChange={setPage}
        label="enquiries"
      />
    </div>
  );
}
