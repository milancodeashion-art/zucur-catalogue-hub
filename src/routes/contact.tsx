import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { WhatsappEnquiryButton } from "@/components/site/WhatsappEnquiryButton";
import { settingsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ZUCUR MART — Wholesale Desk" },
      {
        name: "description",
        content:
          "Contact the ZUCUR MART wholesale desk by phone, email or WhatsApp for bulk pricing, stock availability and dispatch queries.",
      },
      { property: "og:title", content: "Contact ZUCUR MART" },
      {
        property: "og:description",
        content: "Reach our wholesale desk for bulk pricing and stock availability.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useQuery(settingsQuery);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="Talk to our wholesale desk"
        subtitle="Share your requirement by phone, email or WhatsApp — or submit a bulk order inquiry for a written quotation."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {settings?.phone ? (
              <ContactCard icon={Phone} label="Phone" value={settings.phone} href={`tel:${settings.phone}`} />
            ) : null}
            {settings?.email ? (
              <ContactCard
                icon={Mail}
                label="Email"
                value={settings.email}
                href={`mailto:${settings.email}`}
              />
            ) : null}
            {settings?.address ? (
              <ContactCard icon={MapPin} label="Warehouse & office" value={settings.address} />
            ) : null}
            {settings?.business_hours ? (
              <ContactCard icon={Clock} label="Business hours" value={settings.business_hours} />
            ) : null}
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy">Need pricing for a volume?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The fastest route to a wholesale rate is a bulk order inquiry — it captures product,
              quantity and delivery city in one go.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/bulk-order-inquiry">Bulk Order Inquiry</Link>
              </Button>
              <WhatsappEnquiryButton variant="outline" />
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-navy">Good to know</h2>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li>We supply to registered businesses only — no single-unit retail sales.</li>
            <li>Every product page lists its minimum order quantity.</li>
            <li>Quotations are typically shared within one working day.</li>
            <li>Freight and packing are quoted separately based on delivery city.</li>
          </ul>
        </aside>
      </div>
    </SiteLayout>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {href ? (
        <a href={href} className="mt-1 block break-words text-sm font-medium text-navy hover:text-primary">
          {value}
        </a>
      ) : (
        <p className="mt-1 text-sm font-medium text-navy">{value}</p>
      )}
    </div>
  );
}
