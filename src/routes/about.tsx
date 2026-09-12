import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Handshake, PackageCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { WhatsappEnquiryButton } from "@/components/site/WhatsappEnquiryButton";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ZUCUR MART — Wholesale Supply House" },
      {
        name: "description",
        content:
          "ZUCUR MART is a B2B wholesale supplier of packaging, hygiene, disposables, stationery and kitchenware for retailers, distributors, hotels and institutions.",
      },
      { property: "og:title", content: "About ZUCUR MART" },
      {
        property: "og:description",
        content: "A wholesale-only supply house serving businesses across India.",
      },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  {
    icon: Building2,
    title: "Wholesale only",
    text: "We supply businesses, not individual consumers. Every price on the catalogue is a bulk rate.",
  },
  {
    icon: PackageCheck,
    title: "Stocked depth",
    text: "Fast-moving SKUs are held in depth so repeat orders ship without waiting on production.",
  },
  {
    icon: Handshake,
    title: "Quotation-led",
    text: "No cart, no checkout. Pricing is confirmed against your volume, packing and delivery city.",
  },
  {
    icon: Users,
    title: "Account managed",
    text: "A named contact handles your enquiries, follow-ups and dispatch tracking.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About us"
        title="A wholesale partner built for procurement teams"
        subtitle="ZUCUR MART consolidates everyday business consumables into one supply line with transparent MOQ and wholesale rates."
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              ZUCUR MART began as a packaging supplier to local retailers and grew into a
              multi-category wholesale house. Today we serve kirana chains, distributors, cloud
              kitchens, hotels, hospitals, facility management firms and corporate procurement teams.
            </p>
            <p>
              We publish minimum order quantities on every product so buyers can plan volume before
              asking for a price. Once you send a bulk inquiry, our desk checks live stock, applies
              slab pricing and returns a written quotation with dispatch timelines.
            </p>
            <p>
              Because wholesale terms differ from buyer to buyer, ZUCUR MART deliberately has no
              shopping cart or online payment. Every order is confirmed offline against a GST invoice,
              which keeps freight, packing and credit terms negotiable.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <pillar.icon className="size-5" />
                </span>
                <h2 className="mt-4 font-display text-base font-bold text-navy">{pillar.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 rounded-xl bg-navy px-6 py-8 text-navy-foreground">
          <div className="flex-1">
            <h2 className="font-display text-xl font-extrabold">Ready to compare wholesale rates?</h2>
            <p className="mt-1 text-sm text-navy-foreground/75">
              Browse the catalogue or send your requirement and we will quote within a day.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/products">Browse catalogue</Link>
            </Button>
            <WhatsappEnquiryButton />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
