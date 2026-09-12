import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/visitors")({
  component: AdminVisitors,
});

function AdminVisitors() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-visitors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitors")
        .select("id, name, phone, email, first_visit, last_visit, visit_count")
        .order("last_visit", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy">Visitors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone who has identified themselves to access the catalogue.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Visits</th>
              <th className="px-4 py-3">First visit</th>
              <th className="px-4 py-3">Last visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : data?.length ? (
              data.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-medium text-navy">{v.name}</td>
                  <td className="px-4 py-3">{v.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.email ?? "—"}</td>
                  <td className="px-4 py-3">{v.visit_count}</td>
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
                <td colSpan={6} className="px-4 py-6 text-muted-foreground">
                  No visitors recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
