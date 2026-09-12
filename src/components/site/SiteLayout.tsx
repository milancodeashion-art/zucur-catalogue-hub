import type { ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { VisitorGate } from "./VisitorGate";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <VisitorGate />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <section className="bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        {eyebrow ? (
          <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-foreground/75 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
