import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  name: string;
  /** Omit on the current page. */
  to?: "/" | "/categories" | "/products";
  params?: Record<string, string>;
  href?: string;
}

/** Crawlable breadcrumb trail. Rendered as plain HTML links. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="flex min-w-0 items-center gap-1">
              {last || (!item.to && !item.href) ? (
                <span className="truncate font-medium text-navy" aria-current="page">
                  {item.name}
                </span>
              ) : item.href ? (
                <a href={item.href} className="truncate hover:text-primary hover:underline">
                  {item.name}
                </a>
              ) : (
                <Link
                  to={item.to!}
                  className="truncate hover:text-primary hover:underline"
                >
                  {item.name}
                </Link>
              )}
              {last ? null : <ChevronRight className="size-3 shrink-0 opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
