import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  ClipboardList,
  GalleryHorizontal,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  Tags,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import zucurLogo from "@/assets/zucur_logo.png";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  staticData: { sitemap: false },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/banners", label: "Banners", icon: GalleryHorizontal },
  { to: "/admin/inquiries", label: "Bulk Inquiries", icon: ClipboardList },
  { to: "/admin/whatsapp", label: "WhatsApp Log", icon: MessageCircle },
  { to: "/admin/visitors", label: "Visitors", icon: Users },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("claim_admin");
      if (error) throw error;
      return data === true;
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Checking admin access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-display text-xl font-bold text-navy">No admin access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account is signed in but does not have the admin role.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
            <Button asChild>
              <Link to="/">Back to catalogue</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center overflow-hidden rounded-md bg-white p-0">
              <img src={zucurLogo} alt="ZUCUR MART logo" className="h-full w-full rounded-[6px] object-contain" />
            </span>
            <span className="font-display text-sm font-extrabold">ZUCUR MART Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-navy-foreground hover:bg-white/10">
              <Link to="/">View site</Link>
            </Button>
            <Button size="sm" variant="secondary" onClick={signOut}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl gap-6 px-4 py-6 lg:flex">
        <nav className="mb-6 flex gap-2 overflow-x-auto lg:mb-0 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item ? item.exact : false }}
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary/90" }}
              className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-navy"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
