import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ClipboardList,
  Factory,
  MessageCircle,
  Percent,
  Truck,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroBannerCarousel } from "@/components/site/HeroBannerCarousel";
import { ProductCard } from "@/components/site/ProductCard";
import { SiteLayout } from "@/components/site/SiteLayout";
import { WhatsappEnquiryButton } from "@/components/site/WhatsappEnquiryButton";
import { bannersQuery, categoriesQuery, productsQuery, settingsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZUCUR MART — B2B Wholesale Supplier & Bulk Order Enquiries" },
      {
        name: "description",
        content:
          "Wholesale catalogue for packaging, hygiene, disposables, stationery and kitchenware. Compare MOQ, wholesale rates and send bulk order inquiries on WhatsApp.",
      },
      { property: "og:title", content: "ZUCUR MART — B2B Wholesale Supplier" },
      {
        property: "og:description",
        content:
          "Browse wholesale rates, MOQ and stock availability. Enquire on WhatsApp or submit a bulk order inquiry.",
      },
    ],
  }),
  component: HomePage,
});

const BENEFITS = [
  {
    icon: Percent,
    title: "True wholesale pricing",
    text: "Slab-based bulk rates that get sharper as your order quantity grows.",
  },
  {
    icon: Boxes,
    title: "Clear MOQ on every item",
    text: "Minimum order quantity is printed on each product so planning is simple.",
  },
  {
    icon: Truck,
    title: "Pan-India dispatch",
    text: "Palletised, transport-ready packing with LR tracking on every consignment.",
  },
  {
    icon: BadgeCheck,
    title: "Consistent quality",
    text: "Factory-checked batches with specification sheets on request.",
  },
  {
    icon: Factory,
    title: "Direct from source",
    text: "Manufacturer tie-ups remove middle layers from your cost sheet.",
  },
  {
    icon: ClipboardList,
    title: "GST invoicing",
    text: "Proper tax invoices and documentation for every wholesale purchase.",
  },
];

function HomePage() {
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const { data: banners = [] } = useQuery(bannersQuery);

  const featured = products.filter((p) => p.featured).slice(0, 8);
  const newest = products.slice(0, 4);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-navy text-navy-foreground">
        <div className="absolute inset-0 opacity-25 [background:radial-gradient(circle_at_20%_10%,var(--color-primary),transparent_55%),radial-gradient(circle_at_85%_80%,var(--color-gold),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              B2B Wholesale · No retail sales
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Bulk supply, sharper margins for your business
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/80 sm:text-base">
              ZUCUR MART supplies retailers, distributors, hotels, offices and institutions with
              packaging, hygiene, disposables, stationery and kitchenware at wholesale rates. Browse
              the catalogue, check MOQ, and send your requirement in one tap.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/products">
                  Browse Catalogue <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gold/60 bg-transparent text-gold hover:bg-gold hover:text-gold-foreground">
                <Link to="/bulk-order-inquiry">Bulk Order Inquiry</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-navy-foreground/15 pt-6 text-center">
              <div>
                <dt className="font-display text-2xl font-extrabold text-gold">{products.length}+</dt>
                <dd className="text-xs text-navy-foreground/70">Wholesale SKUs</dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-extrabold text-gold">{categories.length}</dt>
                <dd className="text-xs text-navy-foreground/70">Supply categories</dd>
              </div>
              <div>
                <dt className="font-display text-2xl font-extrabold text-gold">24h</dt>
                <dd className="text-xs text-navy-foreground/70">Quotation turnaround</dd>
              </div>
            </dl>
          </div>
          {banners.length > 0 ? (
            <HeroBannerCarousel banners={banners} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  className="group relative overflow-hidden rounded-lg border border-navy-foreground/10"
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-44"
                    />
                  ) : (
                    <div className="h-32 w-full bg-navy-foreground/10 sm:h-44" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-navy/80 px-3 py-2 text-xs font-semibold sm:text-sm">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          eyebrow="Shop by category"
          title="Featured wholesale categories"
          action={{ to: "/categories", label: "All categories" }}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/categories/$slug"
              params={{ slug: category.slug }}
              className="group flex gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="size-20 shrink-0 rounded-md object-cover"
                />
              ) : null}
              <span className="min-w-0">
                <span className="block font-display text-base font-bold text-navy group-hover:text-primary">
                  {category.name}
                </span>
                <span className="mt-1 line-clamp-3 block text-xs leading-relaxed text-muted-foreground">
                  {category.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-card py-14">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Best sellers"
            title="Featured products"
            action={{ to: "/products", label: "View all products" }}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading eyebrow="Why ZUCUR MART" title="Built for wholesale buyers" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                <benefit.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-navy">{benefit.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-xl bg-navy px-6 py-10 text-navy-foreground sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                Bulk requirement?
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
                Send your quantity, get a wholesale quotation
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-navy-foreground/75">
                Share the products, quantities and delivery city. Our team responds with slab pricing
                and dispatch timelines within one working day.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/bulk-order-inquiry">Start Bulk Inquiry</Link>
              </Button>
              <WhatsappEnquiryButton size="lg" label="Enquire on WhatsApp" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          eyebrow="Latest additions"
          title="New in the catalogue"
          action={{ to: "/products", label: "See everything" }}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {newest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-success/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
              <MessageCircle className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-navy">
                Faster answers on WhatsApp
              </h2>
              <p className="text-sm text-muted-foreground">
                Product availability, slab rates and dispatch updates — chat with our wholesale desk.
              </p>
            </div>
          </div>
          <WhatsappEnquiryButton size="lg" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="About us" title="A wholesale partner, not a marketplace" />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            ZUCUR MART operates strictly as a business-to-business supply house. We do not sell single
            units and there is no online checkout — every order is confirmed through a quotation so
            pricing reflects your actual volume, packing and delivery requirement.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Our buyers include kirana chains, distributors, cloud kitchens, hotels, hospitals,
            facility management companies and corporate procurement teams.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/about">
              More about ZUCUR MART <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-navy">Contact our wholesale desk</h2>
          <ul className="mt-5 space-y-4 text-sm">
            {settings?.phone ? (
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                <a href={`tel:${settings.phone}`} className="hover:text-primary">
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings?.email ? (
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-primary">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings?.address ? (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{settings.address}</span>
              </li>
            ) : null}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/contact">Contact page</Link>
            </Button>
            <WhatsappEnquiryButton variant="outline" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { to: "/products" | "/categories"; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-extrabold text-navy sm:text-3xl">{title}</h2>
      </div>
      {action ? (
        <Link
          to={action.to}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          {action.label} <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
