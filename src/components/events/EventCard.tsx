import Link from "next/link";
import type { Area, InterestCategory } from "@prisma/client";

import { AREA_LABELS, INTEREST_LABELS } from "@/lib/community-labels";
import { formatEventPrice } from "@/lib/event-format";
import { getEventCover } from "@/lib/event-images";

export type EventCardData = {
  id: string;
  name: string;
  startDate: Date;
  startTime?: string | null;
  venue?: string | null;
  area?: Area | null;
  category?: InterestCategory | null;
  fee?: string | null;
  organizer?: string | null;
  attendeeCount?: number;
  status?: "MENDATANG" | "BERLANGSUNG" | "SELESAI";
  imageUrl?: string | null;
  description?: string | null;
};

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const WEEKDAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function EventCard({ event }: { event: EventCardData }) {
  const cover = event.imageUrl || getEventCover(event);
  const startDate = new Date(event.startDate);
  const price = formatEventPrice(event.fee);
  const isFree = price === "Gratis";
  const category = event.category ? INTEREST_LABELS[event.category] : "Event";
  const location =
    event.venue ||
    (event.area ? AREA_LABELS[event.area] : null) ||
    "Lokasi menyusul";
  const isPast = event.status === "SELESAI";
  const isLive = event.status === "BERLANGSUNG";
  const description = event.description?.trim();

  return (
    <Link
      href={`/event/${event.id}`}
      className="group relative z-0 flex flex-col rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:z-30 hover:-translate-y-1 hover:border-[#7960D7]/40 hover:shadow-[0_18px_40px_-24px_rgba(26,26,23,0.45)] focus:outline-none focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-[#7960D7] focus-visible:ring-offset-2"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl bg-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          loading="lazy"
          draggable={false}
          className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] ${
            isPast ? "opacity-60" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Date Badge */}
        <div className="absolute left-3 top-3 overflow-hidden rounded-lg bg-white/95 text-center shadow-[0_10px_24px_-16px_rgba(0,0,0,0.55)] ring-1 ring-black/5 backdrop-blur">
          <p className="bg-[#7960D7] px-2.5 py-[3px] text-[8px] font-bold uppercase tracking-[0.18em] text-white">
            {MONTH_SHORT[startDate.getMonth()]}
          </p>
          <p className="px-2.5 pt-1 text-[17px] font-bold leading-none tracking-[-0.02em] text-[#1F2937] tabular-nums">
            {String(startDate.getDate()).padStart(2, "0")}
          </p>
          <p className="px-2.5 pb-1 pt-0.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            {WEEKDAY_SHORT[startDate.getDay()]}
          </p>
        </div>

        {isLive ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#1A1A17]/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#C8B8FF]"
            />
            Berlangsung
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7960D7] sm:text-[10px]">
          {category}
        </span>

        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em] text-[#1F2937] transition-colors group-hover:text-[#7960D7] sm:text-[15px]">
          {event.name}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-500 sm:mt-2.5 sm:text-[11px]">
          {event.startTime ? (
            <>
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
                <ClockIcon />
                <span className="font-medium">{event.startTime}</span>
              </span>
              <span aria-hidden="true" className="h-3 w-px shrink-0 bg-gray-200" />
            </>
          ) : null}
          <span className="inline-flex min-w-0 items-center gap-1">
            <PinIcon />
            <span className="truncate font-medium">{location}</span>
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3 sm:gap-3 sm:pt-3.5">
          <span
            className={`whitespace-nowrap text-xs font-bold sm:text-[13px] ${
              isFree ? "text-[#7960D7]" : "text-[#1F2937]"
            }`}
          >
            {price}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#7960D7] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white transition-colors group-hover:bg-[#6950c7] sm:px-3 sm:text-[10px]">
            Daftar
            <ArrowIcon />
          </span>
        </div>
      </div>

      {/* Hover description */}
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+14px)] left-1/2 z-40 hidden w-64 -translate-x-1/2 translate-y-1.5 opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 lg:block"
      >
        <div className="rounded-lg bg-[#1A1A17] p-4 text-left shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)]">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#C8B8FF]">
            Tentang acara
          </p>
          <p className="mt-2 line-clamp-4 text-[12px] leading-5 text-white/70">
            {description || "Deskripsi acara akan segera tersedia."}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-2.5">
            <span className="min-w-0 truncate text-[10px] text-white/45">
              oleh {event.organizer || "Komunitas"}
            </span>
            <span className="shrink-0 text-[10px] font-medium text-white/85">
              Lihat detail →
            </span>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-full -mt-[5px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#1A1A17]"
        />
      </div>
    </Link>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 text-gray-400"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 text-gray-400"
    >
      <path
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      className="hidden h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 sm:block"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
