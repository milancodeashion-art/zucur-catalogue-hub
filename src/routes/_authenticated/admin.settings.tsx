import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  staticData: { sitemap: false },
  component: AdminSettings,
});

interface Form {
  business_name: string;
  whatsapp_number: string;
  email: string;
  phone: string;
  address: string;
  business_hours: string;
  default_whatsapp_message: string;
  currency: string;
}

const EMPTY: Form = {
  business_name: "",
  whatsapp_number: "",
  email: "",
  phone: "",
  address: "",
  business_hours: "",
  default_whatsapp_message: "",
  currency: "INR",
};

function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);

  const settings = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const data = settings.data;
    if (!data) return;
    setForm({
      business_name: data.business_name ?? "",
      whatsapp_number: data.whatsapp_number ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      address: data.address ?? "",
      business_hours: data.business_hours ?? "",
      default_whatsapp_message: data.default_whatsapp_message ?? "",
      currency: data.currency ?? "INR",
    });
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        business_name: form.business_name.trim() || "ZUCUR MART",
        whatsapp_number: form.whatsapp_number.replace(/[^0-9]/g, ""),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        business_hours: form.business_hours.trim() || null,
        default_whatsapp_message: form.default_whatsapp_message.trim() || null,
        currency: form.currency.trim() || "INR",
      };
      const existingId = settings.data?.id;
      if (existingId) {
        const { error } = await supabase.from("site_settings").update(payload).eq("id", existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Settings saved");
      void queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy">Site settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Business WhatsApp number and contact details shown across the site.
        </p>
      </div>

      <div className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-sm sm:grid-cols-2">
        <div>
          <Label htmlFor="s-name">Business name</Label>
          <Input
            id="s-name"
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="s-wa">WhatsApp number (country code, digits only)</Label>
          <Input
            id="s-wa"
            value={form.whatsapp_number}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="s-email">Email</Label>
          <Input
            id="s-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="s-phone">Phone</Label>
          <Input
            id="s-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="s-hours">Business hours</Label>
          <Input
            id="s-hours"
            value={form.business_hours}
            onChange={(e) => setForm({ ...form, business_hours: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="s-currency">Currency</Label>
          <Input
            id="s-currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="s-address">Address</Label>
          <Textarea
            id="s-address"
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="s-msg">Default WhatsApp message</Label>
          <Textarea
            id="s-msg"
            rows={3}
            value={form.default_whatsapp_message}
            onChange={(e) => setForm({ ...form, default_whatsapp_message: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
