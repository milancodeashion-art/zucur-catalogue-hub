import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

import { categoriesQuery, settingsQuery } from "@/lib/catalog";

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery);
  const { data: categories } = useQuery(categoriesQuery);

  return (
    <footer className="mt-16 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-md bg-gold font-display text-sm font-extrabold text-gold-foreground">
              ZM
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
