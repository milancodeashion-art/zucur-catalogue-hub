import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, Phone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { settingsQuery } from "@/lib/catalog";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/products", label: "Products" },
  { to: "/bulk-order-inquiry", label: "Bulk Order Inquiry" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { data: settings } = useQuery(settingsQuery);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setOpen(false);
    void navigate({ to: "/products", search: term.trim() ? { q: term.trim() } : {} });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur">
      <div className="hidden bg-navy text-navy-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <p className="text-navy-foreground/80">
            Wholesale only · Minimum order quantities apply · GST invoicing
          </p>
          <div className="flex items-center gap-4">
            {settings?.phone ? (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 hover:text-gold">
                <Phone className="size-3" />
                {settings.phone}
              </a>
            ) : null}
            {settings?.business_hours ? (
              <span className="text-navy-foreground/70">{settings.business_hours}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-navy font-display text-sm font-extrabold text-gold">
            ZM
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-extrabold tracking-tight text-navy">
              ZUCUR MART
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              B2B Wholesale
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-primary" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden w-56 xl:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search products or SKU"
              className="h-9 pl-8"
              aria-label="Search products"
            />
          </div>
        </form>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <Menu className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open ? (
        <div className="border-t border-border bg-card px-4 pb-4 lg:hidden">
          <form onSubmit={submitSearch} className="pt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products or SKU"
                className="h-9 pl-8"
                aria-label="Search products"
              />
            </div>
          </form>
          <nav className="mt-3 grid gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button variant="ghost" className="mt-1 w-full" onClick={() => setOpen(false)}>
            <X className="size-4" /> Close
          </Button>
        </div>
      ) : null}
    </header>
  );
}
