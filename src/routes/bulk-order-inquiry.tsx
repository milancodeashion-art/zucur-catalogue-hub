import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoqBadge } from "@/components/site/badges";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { WhatsappEnquiryButton } from "@/components/site/WhatsappEnquiryButton";
import { supabase } from "@/integrations/supabase/client";
import { productsQuery } from "@/lib/catalog";
import { useVisitor } from "@/lib/visitor";

export const Route = createFileRoute("/bulk-order-inquiry")({
  validateSearch: (search: Record<string, unknown>): { product?: string } => {
    const product =
      typeof search.product === "string" && search.product.trim()
        ? search.product.trim().slice(0, 120)
        : undefined;
    return product ? { product } : {};
  },
  head: () => ({
    meta: [
      { title: "Bulk Order Inquiry — ZUCUR MART Wholesale" },
      {
        name: "description",
        content:
          "Send your bulk requirement to ZUCUR MART: product, quantity, company and delivery city. Wholesale quotations within one working day.",
      },
      { property: "og:title", content: "Bulk Order Inquiry — ZUCUR MART" },
      {
        property: "og:description",
        content: "Share quantity and delivery details to receive a wholesale quotation.",
      },
    ],
  }),
  component: BulkOrderInquiryPage,
});

interface FormState {
  productSlug: string;
  companyName: string;
  quantity: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  message: string;
}

function BulkOrderInquiryPage() {
  const search = Route.useSearch();
  const { visitor } = useVisitor();
  const { data: products = [] } = useQuery(productsQuery);

  const [form, setForm] = useState<FormState>({
    productSlug: search.product ?? "",
    companyName: "",
    quantity: "",
    name: "",
    phone: "",
    email: "",
    location: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visitor) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || visitor.name,
        phone: prev.phone || visitor.phone,
        email: prev.email || (visitor.email ?? ""),
      }));
    }
  }, [visitor]);

  const selected = products.find((p) => p.slug === form.productSlug) ?? null;
  const moq = selected?.moq ?? 1;

  useEffect(() => {
    if (selected && !form.quantity) {
      setForm((prev) => ({ ...prev, quantity: String(selected.moq) }));
    }
  }, [selected, form.quantity]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    const quantity = Number(form.quantity);
    if (form.name.trim().length < 2) next.name = "Enter your name";
    if (form.phone.trim().replace(/\D/g, "").length < 8) next.phone = "Enter a valid phone number";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = "Enter a valid email address";
    if (!Number.isFinite(quantity) || quantity < 1) next.quantity = "Enter the quantity you need";
    else if (selected && quantity < moq) next.quantity = `Minimum order quantity is ${moq} units`;
    if (!form.productSlug && form.message.trim().length < 5)
      next.message = "Describe the products and quantities you need";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const { error } = await supabase.from("bulk_order_inquiries").insert({
      visitor_id: visitor?.id ?? null,
      product_id: selected?.id ?? null,
      product_name: selected?.name ?? "Multiple / custom requirement",
      product_sku: selected?.sku ?? null,
      company_name: form.companyName.trim() || null,
      required_quantity: Math.round(quantity),
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      customer_email: form.email.trim() || null,
      delivery_location: form.location.trim() || null,
      message: form.message.trim() || null,
    });
    setSaving(false);

    if (error) {
      toast.error("Could not send your inquiry. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Inquiry received — our wholesale desk will contact you shortly.");
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Wholesale enquiry"
        title="Bulk order inquiry"
        subtitle="Tell us the product, quantity and delivery city. We reply with slab pricing, packing details and dispatch timelines."
      />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {done ? (
            <div className="rounded-lg border border-success/30 bg-success/5 p-8 text-center">
              <CheckCircle2 className="mx-auto size-10 text-success" />
              <h2 className="mt-4 font-display text-2xl font-extrabold text-navy">
                Inquiry submitted
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Reference saved against {form.name.trim()} · {form.phone.trim()}. Our team will share a
                wholesale quotation within one working day.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <WhatsappEnquiryButton product={selected} label="Follow up on WhatsApp" />
                <Button
                  variant="outline"
                  onClick={() => {
                    setDone(false);
                    setForm((prev) => ({ ...prev, productSlug: "", quantity: "", message: "" }));
                  }}
                >
                  Submit another inquiry
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid gap-5 rounded-lg border border-border bg-card p-6 shadow-sm sm:grid-cols-2"
            >
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={form.productSlug || "none"}
                  onValueChange={(value) => {
                    const slug = value === "none" ? "" : value;
                    const next = products.find((p) => p.slug === slug);
                    setForm((prev) => ({
                      ...prev,
                      productSlug: slug,
                      quantity: next ? String(next.moq) : "",
                    }));
                  }}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Multiple / custom requirement</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.slug}>
                        {product.name} · {product.sku}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selected ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>SKU: {selected.sku}</span>
                    <MoqBadge moq={selected.moq} />
                  </div>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quantity">Required quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={selected ? selected.moq : 1}
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  placeholder={selected ? `Minimum ${moq}` : "e.g. 500"}
                />
                {errors.quantity ? (
                  <p className="text-xs text-destructive">{errors.quantity}</p>
                ) : selected ? (
                  <p className="text-xs text-muted-foreground">
                    Minimum order quantity for this item is {moq} units.
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company">Company name</Label>
                <Input
                  id="company"
                  value={form.companyName}
                  maxLength={120}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="Business / firm name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Contact person *</Label>
                <Input
                  id="name"
                  value={form.name}
                  maxLength={100}
                  onChange={(e) => update("name", e.target.value)}
                />
                {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  maxLength={20}
                  inputMode="tel"
                  onChange={(e) => update("phone", e.target.value)}
                />
                {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={form.email}
                  maxLength={150}
                  onChange={(e) => update("email", e.target.value)}
                />
                {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Delivery location</Label>
                <Input
                  id="location"
                  value={form.location}
                  maxLength={150}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="City, state"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="message">Requirement details</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  maxLength={1000}
                  rows={4}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Packing preference, delivery timeline, other SKUs required…"
                />
                {errors.message ? <p className="text-xs text-destructive">{errors.message}</p> : null}
              </div>

              <div className="sm:col-span-2">
                <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Submit bulk inquiry
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-base font-bold text-navy">How it works</h2>
            <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li>1. Share the product and quantity you need.</li>
              <li>2. We check stock and confirm slab pricing.</li>
              <li>3. You receive a written quotation with dispatch timeline.</li>
              <li>4. Order is confirmed offline against a GST invoice.</li>
            </ol>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="font-display text-base font-bold text-navy">Prefer chatting?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Send your requirement on WhatsApp and get a quicker first response.
            </p>
            <WhatsappEnquiryButton className="mt-4 w-full" product={selected} />
          </div>
          <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
            Looking for something not listed?{" "}
            <Link to="/contact" className="font-semibold text-primary hover:underline">
              Contact our sourcing team
            </Link>
            .
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
