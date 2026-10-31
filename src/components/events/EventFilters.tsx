"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export type EventFilterOption = {
  value: string;
  label: string;
  count: number;
};

type EventFiltersProps = {
  categories: EventFilterOption[];
  areas: EventFilterOption[];
  activeCategory: string | null;
  activeArea: string | null;
  currentQuery: string;
  totalCount: number;
  isFiltering: boolean;
};

export function EventFilters({
  categories,
  areas,
  activeCategory,
  activeArea,
  currentQuery,
  totalCount,
  isFiltering,
}: EventFiltersProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = (next: {
    category?: string | null;
    area?: string | null;
  }) => {
    const params = new URLSearchParams();

    if (currentQuery) params.set("q", currentQuery);

    const category =
      next.category === undefined ? activeCategory : next.category;
    const area = next.area === undefined ? activeArea : next.area;

    if (category) params.set("kategori", category);
    if (area) params.set("area", area);

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/event?${query}` : "/event", { scroll: false });
    });
  };

  return (
    <div
      className={`border-y border-[#D9D3C6] bg-[#EFECE4] transition-opacity ${
        pending ? "opacity-60" : ""
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8">
        <div className="relative min-w-0 flex-1">
          <nav
            aria-label="Filter kategori acara"
            className="-mx-5 flex items-center gap-6 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:gap-7 sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <FilterTab
              label="Semua"
              count={totalCount}
              active={!activeCategory}
              onClick={() => navigate({ category: null })}
            />

            {categories.map((category) => (
              <FilterTab
                key={category.value}
                label={category.label}
                count={category.count}
                active={activeCategory === category.value}
                onClick={() =>
                  navigate({
                    category:
                      activeCategory === category.value ? null : category.value,
                  })
                }
              />
            ))}
          </nav>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#EFECE4] to-transparent sm:hidden"
          />
        </div>

        <div className="flex items-center justify-between gap-6 border-t border-[#D9D3C6] py-3 sm:border-t-0 sm:py-0">
          <label className="flex items-center gap-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8C8679]">
              Area
            </span>
            <span className="relative flex items-center">
              <select
                value={activeArea ?? ""}
                onChange={(event) =>
                  navigate({ area: event.target.value || null })
                }
                className="cursor-pointer appearance-none bg-transparent py-1 pr-5 text-xs font-semibold text-[#1A1A17] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7960D7] focus-visible:ring-offset-2"
              >
                <option value="">Semua area</option>
                {areas.map((area) => (
                  <option key={area.value} value={area.value}>
                    {area.label} ({area.count})
                  </option>
                ))}
              </select>
              <svg
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
                className="pointer-events-none absolute right-0 h-3 w-3 text-[#8C8679]"
              >
                <path
                  d="m2.5 4.5 3.5 3 3.5-3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </label>

          {isFiltering ? (
            <Link
              href="/event"
              scroll={false}
              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7960D7] underline decoration-[#7960D7]/30 underline-offset-4 transition-colors hover:decoration-[#7960D7]"
            >
              Reset
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex shrink-0 items-baseline gap-1.5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7960D7] focus-visible:ring-inset ${
        active
          ? "text-[#1A1A17]"
          : "text-[#928C7E] hover:text-[#1A1A17]"
      }`}
    >
      {label}
      <span
        className={`text-[9px] font-medium tracking-normal ${
          active ? "text-[#7960D7]" : "text-[#B3AB9C]"
        }`}
      >
        {String(count).padStart(2, "0")}
      </span>
      {active ? (
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#7960D7]" />
      ) : null}
    </button>
  );
}
