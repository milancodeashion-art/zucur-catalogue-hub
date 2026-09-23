import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/admin/products")({
  staticData: { sitemap: false },
  component: AdminProducts,
});

const PAGE_SIZE = 12;

interface Draft {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  description: string;
  specifications: string;
  price: string;
  discounted_price: string;
  moq: string;
  stock_status: "available" | "stock_out";
  featured: boolean;
  active: boolean;
  images: string[];
}

const EMPTY: Draft = {
  name: "",
  slug: "",
  sku: "",
  category_id: "",
  description: "",
  specifications: "",
  price: "",
  discounted_price: "",
  moq: "1",
  stock_status: "available",
  featured: false,
  active: true,
  images: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const SELECT =
  "id, name, slug, sku, category_id, description, specifications, price, discounted_price, moq, stock_status, featured, active, created_at, category:categories(name), product_images(image_url, display_order)";

function AdminProducts() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [term, setTerm] = useState("");
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState<"all" | "available" | "stock_out">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    setPage(1);
  }, [search, stock]);

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

  const categoryList = categories.data ?? [];

  const products = useQuery({
    queryKey: ["admin-products", search, stock, page],
    queryFn: async () => {
      let query = supabase.from("products").select(SELECT, { count: "exact" });
      if (stock !== "all") query = query.eq("stock_status", stock);
      if (search) {
        const like = `%${search.replace(/[,()]/g, " ")}%`;
        const parts = [`name.ilike.${like}`, `sku.ilike.${like}`, `description.ilike.${like}`];
        const numeric = Number(search);
        if (search !== "" && Number.isFinite(numeric)) {
          parts.push(`price.eq.${numeric}`, `discounted_price.eq.${numeric}`);
        }
        const matchedCategories = categoryList
          .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
          .map((c) => c.id);
        if (matchedCategories.length) {
          parts.push(`category_id.in.(${matchedCategories.join(",")})`);
        }
        query = query.or(parts.join(","));
      }
      const from = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const save = useMutation({
    mutationFn: async (input: Draft) => {
      const price = input.price.trim() === "" ? null : Number(input.price);
      const discounted =
        input.discounted_price.trim() === "" ? null : Number(input.discounted_price);
      const payload = {
        name: input.name.trim(),
        slug: input.slug.trim() || slugify(input.name),
        sku: input.sku.trim(),
        category_id: input.category_id || null,
        description: input.description.trim() || null,
        specifications: input.specifications.trim() || null,
        price,
        discounted_price: discounted,
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

      await supabase.from("product_images").delete().eq("product_id", productId);
      if (input.images.length) {
        const { error } = await supabase.from("product_images").insert(
          input.images.map((image_url, index) => ({
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
    onError: () =>
      toast.error("Could not save the product. Please check the details and try again."),
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
    onError: () => toast.error("Could not delete this product. Please try again."),
  });

  const rows = products.data?.rows ?? [];

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

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products by name, SKU, price, category…"
            className="pl-8"
            aria-label="Search products"
          />
        </div>
        <select
          aria-label="Stock status"
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm sm:w-44"
          value={stock}
          onChange={(e) => setStock(e.target.value as typeof stock)}
        >
          <option value="all">All stock status</option>
          <option value="available">Available</option>
          <option value="stock_out">Stock Out</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">MOQ</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-navy">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">{p.price ?? "On request"}</td>
                  <td className="px-4 py-3 font-medium text-success">
                    {p.discounted_price ?? "—"}
                  </td>
                  <td className="px-4 py-3">{p.moq}</td>
                  <td className="px-4 py-3">
                    {p.stock_status === "stock_out" ? "Stock out" : "Available"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {[p.featured ? "Best sellers" : null, p.active ? "Active" : "Inactive"]
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
                            discounted_price:
                              p.discounted_price === null ? "" : String(p.discounted_price),
                            moq: String(p.moq),
                            stock_status:
                              p.stock_status === "stock_out" ? "stock_out" : "available",
                            featured: p.featured,
                            active: p.active,
                            images: [...(p.product_images ?? [])]
                              .sort((a, b) => a.display_order - b.display_order)
                              .map((img) => img.image_url),
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
                <td colSpan={9} className="px-4 py-6 text-muted-foreground">
                  No products match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={products.data?.count ?? 0}
        onPageChange={setPage}
        label="products"
      />

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
                  {categoryList.map((c) => (
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
                <Label htmlFor="p-price">Regular price (blank = on request)</Label>
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
                <Label htmlFor="p-discount">Discounted price (optional)</Label>
                <Input
                  id="p-discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.discounted_price}
                  onChange={(e) => setDraft({ ...draft, discounted_price: e.target.value })}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Leave blank for no offer. Must not exceed the regular price.
                </p>
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
                <ImageUploader
                  label="Product images (first image is the main image)"
                  folder="products"
                  multiple
                  value={draft.images}
                  onChange={(images) => setDraft({ ...draft, images })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="p-featured"
                  checked={draft.featured}
                  onCheckedChange={(v) => setDraft({ ...draft, featured: v })}
                />
                <Label htmlFor="p-featured">Best sellers</Label>
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
                const price = draft.price.trim() === "" ? null : Number(draft.price);
                const discounted =
                  draft.discounted_price.trim() === "" ? null : Number(draft.discounted_price);
                if (discounted !== null) {
                  if (!Number.isFinite(discounted) || discounted < 0) {
                    toast.error("Discounted price must be a positive number.");
                    return;
                  }
                  if (price === null) {
                    toast.error("Add a regular price before setting a discounted price.");
                    return;
                  }
                  if (discounted > price) {
                    toast.error("Discounted price cannot be greater than the regular price.");
                    return;
                  }
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
