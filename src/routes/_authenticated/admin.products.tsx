import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

interface Draft {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  description: string;
  specifications: string;
  price: string;
  moq: string;
  stock_status: "available" | "stock_out";
  featured: boolean;
  active: boolean;
  images: string;
}

const EMPTY: Draft = {
  name: "",
  slug: "",
  sku: "",
  category_id: "",
  description: "",
  specifications: "",
  price: "",
  moq: "1",
  stock_status: "available",
  featured: false,
  active: true,
  images: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminProducts() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, sku, category_id, description, specifications, price, moq, stock_status, featured, active, created_at, product_images(image_url, display_order)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const categories = useQuery({
    queryKey: ["admin-categories-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (input: Draft) => {
      const payload = {
        name: input.name.trim(),
        slug: input.slug.trim() || slugify(input.name),
        sku: input.sku.trim(),
        category_id: input.category_id || null,
        description: input.description.trim() || null,
        specifications: input.specifications.trim() || null,
        price: input.price.trim() === "" ? null : Number(input.price),
        moq: Math.max(1, Number(input.moq) || 1),
        stock_status: input.stock_status,
        featured: input.featured,
        active: input.active,
      };
      let productId = input.id;
      if (productId) {
        const { error } = await supabase.from("products").update(payload).eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      }

      const urls = input.images
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      await supabase.from("product_images").delete().eq("product_id", productId);
      if (urls.length) {
        const { error } = await supabase.from("product_images").insert(
          urls.map((image_url, index) => ({
            product_id: productId!,
            image_url,
            display_order: index,
          })),
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Product saved");
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit and remove catalogue products.
          </p>
        </div>
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus className="size-4" />
          New product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full min-w-[840px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">MOQ</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : products.data?.length ? (
              products.data.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-navy">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                  <td className="px-4 py-3">{p.price ?? "On request"}</td>
                  <td className="px-4 py-3">{p.moq}</td>
                  <td className="px-4 py-3">
                    {p.stock_status === "stock_out" ? "Stock out" : "Available"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {[p.featured ? "Featured" : null, p.active ? "Active" : "Inactive"]
                      .filter(Boolean)
                      .join(" · ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDraft({
                            id: p.id,
                            name: p.name,
                            slug: p.slug,
                            sku: p.sku,
                            category_id: p.category_id ?? "",
                            description: p.description ?? "",
                            specifications: p.specifications ?? "",
                            price: p.price === null ? "" : String(p.price),
                            moq: String(p.moq),
                            stock_status: p.stock_status === "stock_out" ? "stock_out" : "available",
                            featured: p.featured,
                            active: p.active,
                            images: [...(p.product_images ?? [])]
                              .sort((a, b) => a.display_order - b.display_order)
                              .map((img) => img.image_url)
                              .join("\n"),
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Delete ${p.name}?`)) remove.mutate(p.id);
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
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
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
                <Label htmlFor="p-sku">SKU</Label>
                <Input
                  id="p-sku"
                  value={draft.sku}
                  onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="p-slug">URL slug</Label>
                <Input
                  id="p-slug"
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="p-category">Category</Label>
                <select
                  id="p-category"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={draft.category_id}
                  onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
                >
                  <option value="">Uncategorised</option>
                  {categories.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="p-stock">Availability</Label>
                <select
                  id="p-stock"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={draft.stock_status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      stock_status: e.target.value === "stock_out" ? "stock_out" : "available",
                    })
                  }
                >
                  <option value="available">Available</option>
                  <option value="stock_out">Stock out</option>
                </select>
              </div>
              <div>
                <Label htmlFor="p-price">Price (blank = on request)</Label>
                <Input
                  id="p-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="p-moq">MOQ</Label>
                <Input
                  id="p-moq"
                  type="number"
                  min="1"
                  value={draft.moq}
                  onChange={(e) => setDraft({ ...draft, moq: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p-desc">Description</Label>
                <Textarea
                  id="p-desc"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p-specs">Specifications</Label>
                <Textarea
                  id="p-specs"
                  rows={3}
                  value={draft.specifications}
                  onChange={(e) => setDraft({ ...draft, specifications: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="p-images">Image URLs (one per line)</Label>
                <Textarea
                  id="p-images"
                  rows={3}
                  value={draft.images}
                  onChange={(e) => setDraft({ ...draft, images: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="p-featured"
                  checked={draft.featured}
                  onCheckedChange={(v) => setDraft({ ...draft, featured: v })}
                />
                <Label htmlFor="p-featured">Featured</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="p-active"
                  checked={draft.active}
                  onCheckedChange={(v) => setDraft({ ...draft, active: v })}
                />
                <Label htmlFor="p-active">Active</Label>
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
                if (!draft.name.trim() || !draft.sku.trim()) {
                  toast.error("Name and SKU are required");
                  return;
                }
                save.mutate(draft);
              }}
            >
              {save.isPending ? "Saving…" : "Save product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
