  import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

import zucurLogo from "@/assets/zucur_logo.png";
import { categoriesQuery, settingsQuery } from "@/lib/catalog";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function SocialIcon({ path, className }: { path: string; className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

const SOCIALS = [
  {
    label: "Telegram",
    href: "https://t.me/Newindiacart",
    color: "#229ED9",
    path: "M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 15.3l-1.99 1.93c-.23.23-.42.42-.83.42z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/zucur.mart?stkn=NXRrbjR0dmxtNTdk",
    color: "#E4405F",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.17.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.17-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.17.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.17.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.17-.4-1.24-.06-1.59-.07-4.74-.07zm0 2.76a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8zm0 1.62a3.78 3.78 0 1 0 0 7.56 3.78 3.78 0 0 0 0-7.56zm5.6-3.39a1.26 1.26 0 1 1 0 2.52 1.26 1.26 0 0 1 0-2.52z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@zucurstore?si=CsGQLlbgf_ovwsiy",
    color: "#FF0000",
    path: "M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z",
  },
];

const WHATSAPP_PATH =
  "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.13c-.24.68-1.4 1.31-1.95 1.38-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.17-4.95-4.37-.14-.2-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.68.82 2.35.89 2.52.07.17.12.37.02.57-.09.2-.14.32-.28.49-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.28.7 1.16 1.5 1.88 1.03.92 1.9 1.2 2.18 1.34.27.14.43.12.59-.07.16-.2.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.31.07.11.07.65-.17 1.33z";

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: categories } = useQuery(categoriesQuery);

  return (
    <footer className="mt-16 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center overflow-hidden rounded-md bg-white p-0">
              <img
                src={zucurLogo}
                alt="ZUCUR MART logo"
                className="h-full w-full rounded-[6px] object-contain"
              />
            </span>
            <span className="font-display text-lg font-extrabold">ZUCUR MART</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-navy-foreground/70">
            A B2B wholesale supply house serving retailers, distributors, hotels and institutions
            with bulk-rate packaging, hygiene, disposables and office essentials.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gold">Wholesale enquiries only</p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold">
            Categories
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {(categories ?? []).slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  className="text-navy-foreground/75 transition-colors hover:text-gold"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold">
            Company
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-navy-foreground/75 hover:text-gold">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/products" className="text-navy-foreground/75 hover:text-gold">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/bulk-order-inquiry" className="text-navy-foreground/75 hover:text-gold">
                Bulk Order Inquiry
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-navy-foreground/75 hover:text-gold">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="text-navy-foreground/75 hover:text-gold">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-navy-foreground/75 hover:text-gold">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-navy-foreground/75">
            {settings?.address ? (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>{settings.address}</span>
              </li>
            ) : null}
            {settings?.phone ? (
              <li className="flex gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
                <a href={`tel:${settings.phone}`} className="hover:text-gold">
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings?.email ? (
              <li className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
                <a href={`mailto:${settings.email}`} className="break-all hover:text-gold">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings?.business_hours ? (
              <li className="flex gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>{settings.business_hours}</span>
              </li>
            ) : null}
          </ul>

          <div className="mt-5 flex items-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                style={{ backgroundColor: social.color }}
                className="group/social grid size-9 place-items-center rounded-full shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                <SocialIcon
                  path={social.path}
                  className="size-[18px] text-white transition-transform duration-200 group-hover/social:scale-110"
                />
              </a>
            ))}
            {settings?.whatsapp_number ? (
              <a
                href={`https://wa.me/${digitsOnly(settings.whatsapp_number)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                style={{ backgroundColor: "#25D366" }}
                className="group/social grid size-9 place-items-center rounded-full shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                <SocialIcon
                  path={WHATSAPP_PATH}
                  className="size-[18px] text-white transition-transform duration-200 group-hover/social:scale-110"
                />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-navy-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-navy-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ZUCUR MART. All rights reserved.</p>
          <p>Prices are indicative wholesale rates and exclusive of taxes unless stated.</p>
        </div>
      </div>
    </footer>
  );
}
