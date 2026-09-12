import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ZUCUR MART" },
      {
        name: "description",
        content:
          "How ZUCUR MART collects and uses the business contact details shared for wholesale enquiries and bulk order quotations.",
      },
      { property: "og:title", content: "Privacy Policy — ZUCUR MART" },
      {
        property: "og:description",
        content: "Details on how wholesale enquiry information is handled.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg font-bold text-navy">What we collect</h2>
          <p className="mt-2">
            To access the wholesale catalogue we ask for your full name, phone number and optionally
            your email address. When you submit a bulk order inquiry we also record your company name,
            required quantity, delivery location and requirement notes.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-navy">How we use it</h2>
          <p className="mt-2">
            Your details are used only to respond to wholesale enquiries, prepare quotations, confirm
            stock availability and arrange dispatch. We also keep a record of catalogue enquiries so
            our team can follow up accurately.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-navy">Sharing</h2>
          <p className="mt-2">
            We do not sell or rent your information. Details may be shared with logistics partners
            strictly for delivering a confirmed order.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-navy">WhatsApp enquiries</h2>
          <p className="mt-2">
            Choosing "Enquire on WhatsApp" opens WhatsApp with a pre-written message containing the
            product details and the contact information you provided. Messages sent through WhatsApp
            are also governed by WhatsApp's own privacy terms.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-navy">Retention and requests</h2>
          <p className="mt-2">
            Enquiry records are retained for business and tax purposes. To correct or remove your
            details, contact our wholesale desk and we will action the request.
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
