import { CheckCircle2, PackageX, Layers } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StockStatus } from "@/lib/catalog";

export function MoqBadge({ moq, className }: { moq: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-gold/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold-foreground",
        className,
      )}
    >
      <Layers className="size-3" />
      MOQ: {moq} {moq === 1 ? "Unit" : "Units"}
    </span>
  );
}

export function StockBadge({
  status,
  className,
}: {
  status: StockStatus;
  className?: string;
}) {
  const available = status === "available";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
        available ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive",
        className,
      )}
    >
      {available ? <CheckCircle2 className="size-3" /> : <PackageX className="size-3" />}
      {available ? "Available" : "Stock Out"}
    </span>
  );
}
