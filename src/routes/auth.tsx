import { useEffect, useState } from "react";
import { seoHead } from "@/lib/seo";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import zucurLogo from "@/assets/zucur_logo.png";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () =>
    seoHead({
      title: "Admin Sign In | Zucur Mart",
      description:
        "Secure sign-in for the Zucur Mart wholesale administration portal.",
      path: "/auth",
    noindex: true,
    }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || password.length < 6) {
      toast.error("Enter your email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      void navigate({ to: "/admin", replace: true });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      void navigate({ to: "/admin", replace: true });
      return;
    }
    toast.success("Check your email to confirm the account, then sign in.");
    setMode("signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-lg">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center overflow-hidden rounded-md bg-white p-0">
            <img src={zucurLogo} alt="ZUCUR MART logo" className="h-full w-full rounded-[6px] object-contain" />
          </span>
          <span className="font-display text-lg font-extrabold text-navy">ZUCUR MART</span>
        </Link>
        <h1 className="mt-6 font-display text-2xl font-extrabold text-navy">
          {mode === "signin" ? "Admin sign in" : "Create admin account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Staff access to products, inquiries and site settings.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 text-sm font-medium text-primary hover:underline"
        >
          {mode === "signin"
            ? "First time setup? Create the admin account"
            : "Already have an account? Sign in"}
        </button>

        <Link to="/" className="mt-6 block text-xs text-muted-foreground hover:text-primary">
          ← Back to catalogue
        </Link>
      </div>
    </div>
  );
}
