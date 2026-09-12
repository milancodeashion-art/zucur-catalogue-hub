import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVisitor } from "@/lib/visitor";

export function VisitorGate() {
  const { visitor, ready, register } = useVisitor();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const open = ready && !visitor;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Please enter your full name";
    if (phone.trim().replace(/\D/g, "").length < 8) next.phone = "Enter a valid phone number";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      next.email = "Enter a valid email address";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await register({ name, phone, email });
      toast.success("Welcome to ZUCUR MART wholesale catalogue");
    } catch {
      toast.error("Could not save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md overflow-hidden border-0 p-0 sm:max-w-md"
      >
        <div className="bg-navy px-6 py-6 text-navy-foreground">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Wholesale Access
          </p>
          <DialogTitle className="mt-2 font-display text-2xl font-bold">ZUCUR MART</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-navy-foreground/75">
            Share your business contact to browse wholesale pricing, MOQ and availability.
          </DialogDescription>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6 pt-5">
          <div className="space-y-1.5">
            <Label htmlFor="gate-name">Full Name *</Label>
            <Input
              id="gate-name"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Mehta"
            />
            {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gate-phone">Phone Number *</Label>
            <Input
              id="gate-phone"
              value={phone}
              maxLength={20}
              inputMode="tel"
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
            />
            {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gate-email">Email (optional)</Label>
            <Input
              id="gate-email"
              value={email}
              maxLength={150}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="purchase@company.com"
            />
            {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Please wait…" : "Enter Catalogue"}
          </Button>
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
            Your details are used only for wholesale enquiries and quotations.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
