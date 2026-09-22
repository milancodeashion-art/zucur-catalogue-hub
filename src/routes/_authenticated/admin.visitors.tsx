import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Pagination } from "@/components/admin/Pagination";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/visitors")({
  staticData: { sitemap: false },
  component: AdminVisitors,
});

const PAGE_SIZE = 15;

function AdminVisitors() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-visitors", page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await supabase
        .from("visitors")
        .select(
          "id, name, phone, email, first_visit, last_visit, visit_count, whatsapp_enquiries(count)",
          { count: "exact" },
        )
        .order("last_visit", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      const rows = (data ?? []).map((row) => {
        const relation = (row as unknown as { whatsapp_enquiries?: { count: number }[] })
          .whatsapp_enquiries;
        return { ...row, enquiries: relation?.[0]?.count ?? 0 };
      });
      return { rows, count: count ?? 0 };
    },
  });

  const rows = data?.rows ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy">Visitors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone who has identified themselves to access the catalogue.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Visits</th>
              <th className="px-4 py-3">Enquiries</th>
              <th className="px-4 py-3">First visit</th>
              <th className="px-4 py-3">Last visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-medium text-navy">{v.name}</td>
                  <td className="px-4 py-3">{v.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.email ?? "—"}</td>
                  <td className="px-4 py-3">{v.visit_count}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{v.enquiries}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(v.first_visit).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(v.last_visit).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-muted-foreground">
                  No visitors recorded yet.
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
        label="visitors"
      />
    </div>
  );
}
