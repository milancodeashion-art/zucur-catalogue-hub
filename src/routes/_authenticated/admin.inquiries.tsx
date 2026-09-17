import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: AdminInquiries,
});

const STATUSES = ["New", "Contacted", "In Progress", "Completed", "Cancelled"] as const;
const PAGE_SIZE = 12;

function AdminInquiries() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const inquiries = useQuery({
    queryKey: ["admin-inquiries", filter, page],
    queryFn: async () => {
      let query = supabase.from("bulk_order_inquiries").select("*", { count: "exact" });
      if (filter !== "All") query = query.eq("status", filter);
      const from = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const update = useMutation({
    mutationFn: async (input: { id: string; status?: string; admin_notes?: string }) => {
      const patch: { status?: string; admin_notes?: string } = {};
      if (input.status !== undefined) patch.status = input.status;
      if (input.admin_notes !== undefined) patch.admin_notes = input.admin_notes;
      const { error } = await supabase
        .from("bulk_order_inquiries")
        .update(patch)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Inquiry updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = (inquiries.data ?? []).filter(
    (row) => filter === "All" || row.status === filter,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy">Bulk order inquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and progress every wholesale enquiry.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", ...STATUSES] as string[]).map((status) => (
          <Button
            key={status}
            size="sm"
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      {inquiries.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length ? (
        <div className="grid gap-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-bold text-navy">
                    {row.product_name ?? "General enquiry"}
                    {row.product_sku ? (
                      <span className="ml-2 text-xs font-medium text-muted-foreground">
                        {row.product_sku}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.required_quantity} units · {row.customer_name}
                    {row.company_name ? ` · ${row.company_name}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.customer_phone}
                    {row.customer_email ? ` · ${row.customer_email}` : ""}
                    {row.delivery_location ? ` · ${row.delivery_location}` : ""}
                  </p>
                  {row.message ? (
                    <p className="mt-2 max-w-2xl text-sm text-foreground">{row.message}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={row.status}
                    onChange={(e) => update.mutate({ id: row.id, status: e.target.value })}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <Textarea
                  rows={2}
                  placeholder="Internal notes"
                  value={notes[row.id] ?? row.admin_notes ?? ""}
                  onChange={(e) => setNotes({ ...notes, [row.id]: e.target.value })}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update.mutate({
                        id: row.id,
                        admin_notes: notes[row.id] ?? row.admin_notes ?? "",
                      })
                    }
                  >
                    Save notes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No inquiries in this view.</p>
      )}
    </div>
  );
}
