import Link from "next/link";
import type { Area, InterestCategory } from "@prisma/client";

import { AREA_LABELS, INTEREST_LABELS } from "@/lib/community-labels";
import { formatEventDate, formatEventPrice } from "@/lib/event-format";
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
};

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

  return (
    <Link
      href={`/event/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-[#7960D7] hover:shadow-md hover:scale-105"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt=""
          loading="lazy"
          draggable={false}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 ${
            isPast ? "opacity-60" : ""
          }`}
        />

        {/* Date Badge */}
        <div className="absolute left-2 top-2 rounded bg-white/95 backdrop-blur px-1.5 py-0.5 shadow-sm">
          <p className="text-[10px] font-bold text-gray-900">
            {startDate.getDate()}
          </p>
          <p className="text-[8px] font-semibold text-gray-500 uppercase">
            {startDate.toLocaleString('id-ID', { month: 'short' })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 space-y-2">
        {/* Category */}
        <span className="text-[10px] font-bold text-[#7960D7] uppercase tracking-wider">
          {category}
        </span>

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-bold text-[#1F2937] group-hover:text-[#7960D7] transition-colors leading-snug">
          {event.name}
        </h3>

        {/* Meta Info with Icons */}
        <div className="space-y-1">
          {event.startTime && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{event.startTime}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="truncate font-semibold">{location}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span
            className={`text-xs font-bold ${
              isFree ? "text-[#7960D7]" : "text-[#1F2937]"
            }`}
          >
            {price}
          </span>
          <button className="px-2.5 py-1 text-xs font-bold bg-[#7960D7] text-white hover:bg-[#6950c7] rounded transition-colors uppercase tracking-wide">
            Daftar
          </button>
        </div>
      </div>
    </Link>
  );
}
