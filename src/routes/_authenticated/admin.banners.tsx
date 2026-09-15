import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/admin/ImageUploader";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: AdminBanners,
});

const PAGE_SIZE = 10;

interface Draft {
  id?: string;
  image: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  display_order: string;
  active: boolean;
}

const EMPTY: Draft = {
  image: "",
  title: "",
  description: "",
  button_text: "",
  button_link: "",
  display_order: "0",
  active: true,
};

function AdminBanners() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const banners = useQuery({
    queryKey: ["admin-banners", page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await supabase
        .from("banners")
        .select("*", { count: "exact" })
        .order("display_order", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  useEffect(() => {
    const total = banners.data?.count ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > pageCount) setPage(pageCount);
  }, [banners.data?.count, page]);

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    void queryClient.invalidateQueries({ queryKey: ["banners"] });
  }

  const save = useMutation({
    mutationFn: async (input: Draft) => {
      const payload = {
        image: input.image,
        title: input.title.trim() || null,
        description: input.description.trim() || null,
        button_text: input.button_text.trim() || null,
        button_link: input.button_link.trim() || null,
        display_order: Number(input.display_order) || 0,
        active: input.active,
      };
      if (input.id) {
        const { error } = await supabase.from("banners").update(payload).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Banner saved");
      setDraft(null);
      invalidate();
    },
    onError: () => toast.error("Banner could not be saved. Please try again."),
  });

  const toggle = useMutation({
    mutationFn: async (input: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("banners")
        .update({ active: input.active })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Banner status updated");
      invalidate();
    },
    onError: () => toast.error("Could not update the banner status. Please try again."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Banner deleted");
      setDeleteId(null);
      invalidate();
    },
    onError: () => toast.error("Could not delete this banner. Please try again."),
  });

  const rows = banners.data?.rows ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy">Banners</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the homepage banner slider. Only active banners appear, in display order.
          </p>
        </div>
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus className="size-4" />
          Add banner
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">Banner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Display order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {banners.isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3">
                    {b.image ? (
                      <img
                        src={b.image}
                        alt={b.title ?? "Banner"}
                        className="h-14 w-24 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <span className="grid h-14 w-24 place-items-center rounded-md bg-secondary text-muted-foreground">
                        <ImageOff className="size-5" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{b.title ?? "Untitled banner"}</p>
                    {b.description ? (
                      <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-muted-foreground">
                        {b.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        b.active
                          ? "rounded bg-success/15 px-2 py-0.5 text-xs font-semibold text-success"
                          : "rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {b.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{b.display_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreview(b.image)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggle.mutate({ id: b.id, active: !b.active })}
                      >
                        {b.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDraft({
                            id: b.id,
                            image: b.image,
                            title: b.title ?? "",
                            description: b.description ?? "",
                            button_text: b.button_text ?? "",
                            button_link: b.button_link ?? "",
                            display_order: String(b.display_order),
                            active: b.active,
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteId(b.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  No banners yet. Add your first homepage banner.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={banners.data?.count ?? 0}
        onPageChange={setPage}
        label="banners"
      />

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit banner" : "Add banner"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="grid gap-4">
              <ImageUploader
                label="Banner image"
                folder="banners"
                value={draft.image ? [draft.image] : []}
                onChange={(urls) => setDraft({ ...draft, image: urls[0] ?? "" })}
                hint="Wide landscape images work best · JPG, PNG, WEBP up to 10 MB."
              />
              <div>
                <Label htmlFor="b-title">Title (optional)</Label>
                <Input
                  id="b-title"
                  value={draft.title}
                  maxLength={120}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="b-desc">Description (optional)</Label>
                <Textarea
                  id="b-desc"
                  rows={2}
                  maxLength={300}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="b-btn">Button text (optional)</Label>
                  <Input
                    id="b-btn"
                    value={draft.button_text}
                    maxLength={40}
                    onChange={(e) => setDraft({ ...draft, button_text: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="b-link">Button link (optional)</Label>
                  <Input
                    id="b-link"
                    value={draft.button_link}
                    placeholder="/products"
                    onChange={(e) => setDraft({ ...draft, button_link: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="b-order">Display order</Label>
                <Input
                  id="b-order"
                  type="number"
                  value={draft.display_order}
                  onChange={(e) => setDraft({ ...draft, display_order: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="b-active"
                  checked={draft.active}
                  onCheckedChange={(v) => setDraft({ ...draft, active: v })}
                />
                <Label htmlFor="b-active">Active on homepage</Label>
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
                if (!draft.image) {
                  toast.error("Please upload a banner image first.");
                  return;
                }
                save.mutate(draft);
              }}
            >
              {save.isPending ? "Saving…" : "Save banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this banner? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => deleteId && remove.mutate(deleteId)}
            >
              {remove.isPending ? "Deleting…" : "Delete banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Banner preview</DialogTitle>
          </DialogHeader>
          {preview ? (
            <img
              src={preview}
              alt="Banner preview"
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
