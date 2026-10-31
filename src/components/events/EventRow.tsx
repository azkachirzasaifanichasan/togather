import Link from "next/link";
import type { EventSummary } from "@/server/events";

import { AREA_LABELS, INTEREST_LABELS } from "@/lib/community-labels";
import {
  formatEventAttendance,
  formatEventDateParts,
  formatEventPrice,
} from "@/lib/event-format";
import { getEventCover } from "@/lib/event-images";

export function EventRow({ event }: { event: EventSummary }) {
  const date = new Date(event.startDate);
  const parts = formatEventDateParts(date);
  const cover = getEventCover(event);
  const category = INTEREST_LABELS[event.category];
  const area = event.area ? AREA_LABELS[event.area] : null;
  const location =
    event.venue || area || "Lokasi menyusul";
  const price = formatEventPrice(event.fee);
  const isFree = price === "Gratis";
  const isPast = event.status === "SELESAI";
  const isLive = event.status === "BERLANGSUNG";
  const attendance = formatEventAttendance(event);

  return (
    <Link
      href={`/event/${event.id}`}
      className={`group -mx-3 grid grid-cols-[54px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-[#1A1A17]/12 px-3 py-5 transition-colors hover:bg-white/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7960D7] focus-visible:ring-offset-2 sm:-mx-4 sm:grid-cols-[76px_168px_minmax(0,1fr)_auto] sm:gap-x-6 sm:px-4 sm:py-6 lg:grid-cols-[88px_196px_minmax(0,1fr)_auto] lg:gap-x-8`}
    >
      <time
        dateTime={date.toISOString()}
        className="flex flex-col self-start sm:self-center"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8C8679]">
          {parts.weekday}
        </span>
        <span
          className={`mt-0.5 text-[28px] font-semibold leading-none tracking-[-0.03em] tabular-nums transition-colors group-hover:text-[#7960D7] sm:text-[32px] ${
            isPast ? "text-[#8C8679]" : "text-[#1A1A17]"
          }`}
        >
          {parts.day}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8C8679]">
          {parts.month}
        </span>
      </time>

      <span className="relative hidden aspect-[4/3] overflow-hidden bg-[#E5E0D4] sm:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          loading="lazy"
          draggable={false}
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
            isPast ? "opacity-55 grayscale-[35%]" : ""
          }`}
        />
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9px] font-semibold uppercase tracking-[0.15em]">
          <span className="text-[#7960D7]">{category}</span>
          {area ? (
            <>
              <span aria-hidden="true" className="h-px w-4 bg-[#C9C3B5]" />
              <span className="text-[#8C8679]">{area}</span>
            </>
          ) : null}
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-[#1A1A17]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[#7960D7]"
              />
              Berlangsung
            </span>
          ) : null}
          {event.dataSource === "REFERENCE_UNVERIFIED" ? (
            <span className="border border-[#1A1A17]/20 px-1.5 py-0.5 text-[8px] text-[#8C8679]">
              Referensi
            </span>
          ) : null}
          {isPast ? (
            <span className="border border-[#1A1A17]/20 px-1.5 py-0.5 text-[8px] text-[#8C8679] sm:hidden">
              Selesai
            </span>
          ) : null}
        </div>

        <h3
          className={`mt-1.5 text-[17px] font-semibold leading-snug tracking-[-0.015em] sm:text-[19px] ${
            isPast
              ? "text-[#6F6A60] transition-colors group-hover:text-[#1A1A17]"
              : "text-[#1A1A17]"
          }`}
        >
          {event.name}
        </h3>

        <p className="mt-1 line-clamp-1 max-w-2xl text-[13px] leading-6 text-[#767064] sm:line-clamp-2">
          {event.description}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#8C8679]">
          {event.startTime ? <span>{event.startTime}</span> : null}
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <PinIcon />
            <span className="truncate">{location}</span>
          </span>
          <span className={`sm:hidden ${isFree ? "text-[#7960D7]" : "font-medium text-[#5F5A50]"}`}>
            {price}
          </span>
        </div>
      </div>

      <div className="hidden items-center justify-end gap-5 sm:flex">
        <div className="text-right">
          <p
            className={`text-[13px] font-semibold ${
              isPast
                ? "text-[#8C8679]"
                : isFree
                  ? "text-[#7960D7]"
                  : "text-[#1A1A17]"
            }`}
          >
            {isPast ? "Selesai" : price}
          </p>
          <p className="mt-1 whitespace-nowrap text-[10px] text-[#8C8679]">
            {isPast ? "Arsip acara" : attendance}
          </p>
        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1A1A17]/15 text-[#1A1A17] transition-all duration-300 group-hover:border-[#1A1A17] group-hover:bg-[#1A1A17] group-hover:text-white">
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
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
      strokeWidth={1.5}
      aria-hidden="true"
      className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    >
      <path
        d="M7 17 17 7M9 7h8v8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
