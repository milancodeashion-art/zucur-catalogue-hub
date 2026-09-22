import { seoHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () =>
    seoHead({
      title: "Terms & Conditions | Zucur Mart Wholesale",
      description:
        "Terms and conditions for wholesale enquiries, quotations and bulk orders placed with Zucur Mart in Surat, Gujarat.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Terms & Conditions" />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg font-bold text-navy">Wholesale only</h2>
          <p className="mt-2">
            This catalogue is intended for business buyers. ZUCUR MART does not sell single units to
            consumers and there is no online checkout or online payment facility.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-navy">Pricing</h2>
          <p className="mt-2">
            Prices shown are indicative wholesale rates and may change with market movement, packing
            choice, order volume and delivery location. Taxes and freight are additional unless a
            quotation states otherwise.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-navy">Minimum order quantity</h2>
          <p className="mt-2">
            Each product lists a minimum order quantity (MOQ). Inquiries below the MOQ for an item
            cannot be processed at the listed rate.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-navy">Quotations and orders</h2>
          <p className="mt-2">
            An inquiry is a request, not an order. Orders are confirmed only after ZUCUR MART issues a
            written quotation and the buyer accepts it in writing. Stock availability is confirmed at
            the time of quotation.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-navy">Product information</h2>
          <p className="mt-2">
            Images are representative. Specifications, pack sizes and shades may vary slightly between
            production batches; material specification sheets are available on request.
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
