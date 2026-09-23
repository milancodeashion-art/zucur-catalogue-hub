import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/admin/ImageUploader";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { imageSrc } from "@/lib/upload";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  staticData: { sitemap: false },
  component: AdminCategories,
});

const PAGE_SIZE = 10;

interface Draft {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  display_order: string;
  active: boolean;
  featured: boolean;
}

const EMPTY: Draft = {
  name: "",
  slug: "",
  description: "",
  image: "",
  display_order: "0",
  active: true,
  featured: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminCategories() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [page, setPage] = useState(1);

  const categories = useQuery({
    queryKey: ["admin-categories", page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await supabase
        .from("categories")
        .select("id, name, slug, description, image, display_order, active, featured", { count: "exact" })
        .order("display_order")
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  useEffect(() => {
    const total = categories.data?.count ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > pageCount) setPage(pageCount);
  }, [categories.data?.count, page]);

  const save = useMutation({
    mutationFn: async (input: Draft) => {
      const payload = {
        name: input.name.trim(),
        slug: input.slug.trim() || slugify(input.name),
        description: input.description.trim() || null,
        image: input.image.trim() || null,
        display_order: Number(input.display_order) || 0,
        active: input.active,
        featured: input.featured,
      };
      if (input.id) {
        const { error } = await supabase.from("categories").update(payload).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Category saved");
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Could not save the category. Please try again."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: () => toast.error("Could not delete this category. Please try again."),
  });

  const rows = categories.data?.rows ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organise the catalogue into wholesale categories.
          </p>
        </div>
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus className="size-4" />
          New category
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    {c.image ? (
                      <img
                        src={imageSrc(c.image) ?? ""}
                        alt={c.name}
                        className="size-12 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <span className="grid size-12 place-items-center rounded-md bg-secondary text-muted-foreground">
                        <ImageOff className="size-4" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-3">{c.display_order}</td>
                  <td className="px-4 py-3">{c.active ? "Active" : "Hidden"}</td>
                  <td className="px-4 py-3">{c.featured ? "Featured" : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDraft({
                            id: c.id,
                            name: c.name,
                            slug: c.slug,
                            description: c.description ?? "",
                            image: c.image ?? "",
                            display_order: String(c.display_order),
                            active: c.active,
                            featured: c.featured,
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Delete ${c.name}?`)) remove.mutate(c.id);
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-muted-foreground">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={categories.data?.count ?? 0}
        onPageChange={setPage}
        label="categories"
      />

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="grid gap-4">
              <div>
                <Label htmlFor="c-name">Name</Label>
                <Input
                  id="c-name"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      name: e.target.value,
                      slug: draft.id ? draft.slug : slugify(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="c-slug">URL slug</Label>
                <Input
                  id="c-slug"
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="c-desc">Description</Label>
                <Textarea
                  id="c-desc"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <ImageUploader
                label={draft.image ? "Category image" : "Upload category image"}
                folder="categories"
                value={draft.image ? [draft.image] : []}
                onChange={(urls) => setDraft({ ...draft, image: urls[0] ?? "" })}
              />
              <div>
                <Label htmlFor="c-order">Display order</Label>
                <Input
                  id="c-order"
                  type="number"
                  value={draft.display_order}
                  onChange={(e) => setDraft({ ...draft, display_order: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="c-active"
                  checked={draft.active}
                  onCheckedChange={(v) => setDraft({ ...draft, active: v })}
                />
                <Label htmlFor="c-active">Visible on site</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="c-featured"
                  checked={draft.featured}
                  onCheckedChange={(v) => setDraft({ ...draft, featured: v })}
                />
                <Label htmlFor="c-featured">Featured category</Label>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              disabled={save.isPending}
              onClick={() => {
                if (!draft) return;
                if (!draft.name.trim()) {
                  toast.error("Name is required");
                  return;
                }
                save.mutate(draft);
              }}
            >
              {save.isPending ? "Saving…" : "Save category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
