import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Banner } from "@/lib/catalog";
import { imageSrc } from "@/lib/upload";
import { cn } from "@/lib/utils";

const INTERVAL = 4500;

export function HeroBannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(timer);
  }, [paused, count]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (count === 0) return null;

  return (
    <div
      className="relative h-64 w-full overflow-hidden rounded-xl border border-navy-foreground/10 bg-navy-foreground/5 shadow-lg sm:h-80 lg:h-[22rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured offers"
    >
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <img
            src={imageSrc(banner.image) ?? ""}
            alt={banner.title ?? "ZUCUR MART offer"}
            loading={i === 0 ? "eager" : "lazy"}
            className="size-full object-cover"
          />
          {banner.title || banner.description || banner.button_text ? (
            <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t from-navy/85 via-navy/35 to-transparent p-5 sm:p-7">
              {banner.title ? (
                <h2 className="font-display text-xl font-extrabold leading-tight text-white sm:text-2xl">
                  {banner.title}
                </h2>
              ) : null}
              {banner.description ? (
                <p className="max-w-md text-xs leading-relaxed text-white/80 sm:text-sm">
                  {banner.description}
                </p>
              ) : null}
              {banner.button_text && banner.button_link ? (
                <a
                  href={banner.button_link}
                  className="mt-1 inline-flex w-fit items-center rounded-md bg-gold px-4 py-2 text-xs font-bold text-gold-foreground transition-colors hover:bg-gold/90 sm:text-sm"
                >
                  {banner.button_text}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous banner"
            className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-navy/60 text-white backdrop-blur transition-colors hover:bg-navy/80"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next banner"
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-navy/60 text-white backdrop-blur transition-colors hover:bg-navy/80"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-gold" : "w-1.5 bg-white/60 hover:bg-white",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
