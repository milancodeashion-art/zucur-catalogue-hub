import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  label?: string;
}

function pageNumbers(page: number, pageCount: number): number[] {
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  return [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
}

export function Pagination({ page, pageSize, total, onPageChange, label = "records" }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const pages = pageNumbers(page, pageCount);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Showing {from}–{to} of {total} {label}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        {pages.map((p, index) => (
          <span key={p} className="flex items-center gap-1.5">
            {index > 0 && p - (pages[index - 1] as number) > 1 ? (
              <span className="px-1 text-xs text-muted-foreground">…</span>
            ) : null}
            <Button
              size="sm"
              variant={p === page ? "default" : "outline"}
              className="min-w-9"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          </span>
        ))}
        <Button
          size="sm"
          variant="outline"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
