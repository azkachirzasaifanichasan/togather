import Link from "next/link";
import type { EventSummary } from "@/server/events";

import { AREA_LABELS, INTEREST_LABELS } from "@/lib/community-labels";
import {
  formatEventAttendance,
  formatEventDateParts,
  formatEventPrice,
} from "@/lib/event-format";
import { getEventBackdrop } from "@/lib/event-images";

const DISPLAY_FONT = "font-[family-name:var(--font-event-display)]";

export function FeaturedEvent({ event }: { event: EventSummary }) {
  const date = new Date(event.startDate);
  const parts = formatEventDateParts(date);
  const cover = getEventBackdrop(event);
  const category = INTEREST_LABELS[event.category];
  const area = event.area ? AREA_LABELS[event.area] : null;
  const location = event.venue || area || "Lokasi menyusul";
  const price = formatEventPrice(event.fee);
  const isFree = price === "Gratis";
  const isLive = event.status === "BERLANGSUNG";
  const attendance = formatEventAttendance(event);

  return (
    <Link
      href={`/event/${event.id}`}
      className="group grid overflow-hidden border border-[#1A1A17]/20 bg-[#191A17] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7960D7] focus-visible:ring-offset-4 lg:grid-cols-[1.22fr_0.88fr]"
    >
      <div className="relative min-h-[280px] overflow-hidden sm:min-h-[380px] lg:min-h-[540px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        <time
          dateTime={date.toISOString()}
          className="absolute left-5 top-5 flex min-w-[74px] flex-col items-center bg-[#F6F4EE] px-4 py-3 text-[#1A1A17] sm:left-7 sm:top-7"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8C8679]">
            {parts.weekday}
          </span>
          <span className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
            {parts.day}
          </span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8C8679]">
            {parts.month} {parts.year}
          </span>
        </time>

        <div className="absolute inset-x-5 bottom-5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/85 sm:inset-x-7 sm:bottom-7">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 bg-[#C8B8FF] ${
              isLive ? "rounded-full" : ""
            }`}
          />
          {isLive ? "Sedang berlangsung" : `${category} · ${area ?? "Yogyakarta"}`}
        </div>
      </div>

      <div className="flex flex-col justify-between px-6 py-7 text-white sm:px-9 sm:py-9 lg:px-10 lg:py-11">
        <div>
          <div className="flex items-center justify-between gap-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
            <span>Sorotan agenda</span>
            <span>Agenda kota</span>
          </div>

          <h3
            className={`${DISPLAY_FONT} mt-7 text-[2.4rem] font-normal leading-[0.98] tracking-[-0.01em] sm:text-[3.2rem] lg:text-[3.4rem]`}
          >
            {event.name}
          </h3>

          <p className="mt-4 line-clamp-3 max-w-md text-[13px] leading-6 text-white/55">
            {event.description}
          </p>
        </div>

        <div className="mt-10">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/15 pt-6">
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Tanggal
              </dt>
              <dd className="mt-1.5 text-[13px] text-white/90">
                {parts.day} {parts.month} {parts.year}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Waktu
              </dt>
              <dd className="mt-1.5 text-[13px] text-white/90">
                {event.startTime || "Menyusul"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Lokasi
              </dt>
              <dd className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-white/90">
                {location}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Biaya
              </dt>
              <dd
                className={`mt-1.5 text-[13px] ${
                  isFree ? "text-[#C8B8FF]" : "text-white/90"
                }`}
              >
                {price}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Peserta
              </dt>
              <dd className="mt-1.5 text-[13px] text-white/90">
                {attendance}
              </dd>
            </div>
          </dl>

          <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/15 pt-5">
            <p className="min-w-0 truncate text-[10px] text-white/40">
              oleh {event.organizer}
            </p>
            <span className="inline-flex shrink-0 items-center gap-2 text-[12px] font-medium text-white">
              Lihat acara
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
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
