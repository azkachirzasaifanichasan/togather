import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { EventBanner } from "@/components/events/EventBanner";
import type { BannerEvent } from "@/components/events/EventBanner";
import { EventCard } from "@/components/events/EventCard";
import { AREA_LABELS, INTEREST_LABELS } from "@/lib/community-labels";
import { formatEventDate, formatEventPrice } from "@/lib/event-format";
import { getEventBackdrop, getEventCover } from "@/lib/event-images";
import { getUpcomingEvents } from "@/server/events";
import type { EventSummary } from "@/server/events";

function sortBySchedule(events: EventSummary[]): EventSummary[] {
  const now = Date.now();
  return [...events].sort((a, b) => {
    const aPast = a.startDate.getTime() < now;
    const bPast = b.startDate.getTime() < now;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return aPast
      ? b.startDate.getTime() - a.startDate.getTime()
      : a.startDate.getTime() - b.startDate.getTime();
  });
}

function matchesQuery(event: EventSummary, query: string): boolean {
  return [
    event.name,
    event.description,
    event.venue,
    event.organizer,
    event.category,
    event.area,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function toBannerEvent(event: EventSummary): BannerEvent {
  return {
    id: event.id,
    name: event.name,
    category: INTEREST_LABELS[event.category].toUpperCase(),
    date: formatEventDate(new Date(event.startDate)),
    time: event.startTime,
    venue: event.venue || (event.area ? AREA_LABELS[event.area] : "Lokasi menyusul"),
    price: formatEventPrice(event.fee),
    image: getEventBackdrop(event),
  };
}

function locationOf(event: EventSummary) {
  return (
    event.venue ||
    (event.area ? AREA_LABELS[event.area] : null) ||
    "Lokasi menyusul"
  );
}

export default async function EventPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const allEvents = await getUpcomingEvents();
  const searchedEvents = query
    ? allEvents.filter((event) => matchesQuery(event, query.toLowerCase()))
    : allEvents;

  const sortedEvents = sortBySchedule(searchedEvents);
  const upcomingEvents = sortedEvents.filter((event) => event.status !== "SELESAI");
  const pastEvents = sortedEvents.filter((event) => event.status === "SELESAI");

  const bannerEvents = sortBySchedule(
    allEvents.filter((event) => event.status !== "SELESAI")
  )
    .slice(0, 5)
    .map(toBannerEvent);

  const upcomingCount = allEvents.filter((event) => event.status !== "SELESAI").length;
  const pastCount = allEvents.length - upcomingCount;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header showSearch={false} />

      <main className="flex-1">
        {/* Header Section */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <span>Kurasi Terverifikasi</span>
                <span className="text-gray-300">•</span>
                <span>Events Komunitas</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-[#1F2937]">
                Events
              </h1>
              <p className="text-sm text-gray-600 max-w-2xl">
                Temukan events yang sesuai dengan minat dan jadwal kamu di Yogyakarta
              </p>
            </div>
          </div>
        </div>

        {/* Event Banner Carousel */}
        {bannerEvents.length > 0 && !query ? (
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-6">
            <EventBanner events={bannerEvents} />
          </div>
        ) : null}

        {/* Search & Filter Toolbar - BELOW BANNER */}
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search Section */}
            <form action="/event" method="get" role="search" className="relative flex-1">
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Cari events"
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
              />
            </form>

            {/* Area Dropdown */}
            <select className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-[#374151] hover:border-[#7960D7] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]/30 cursor-pointer transition-colors"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                paddingRight: "28px",
              }}>
              <option value="">Semua Wilayah</option>
              <option value="kota">Kota Yogyakarta</option>
              <option value="sleman">Sleman</option>
              <option value="bantul">Bantul</option>
              <option value="kulonprogo">Kulon Progo</option>
              <option value="gunungkidul">Gunungkidul</option>
            </select>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7] transition-all shrink-0">
              Olahraga
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7] transition-all shrink-0">
              Teknologi
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7] transition-all shrink-0">
              Pendidikan
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7] transition-all shrink-0">
              Seni & Hiburan
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7] transition-all shrink-0">
              Sosial
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7] transition-all shrink-0">
              Lingkungan
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7] transition-all shrink-0">
              Bisnis & Karier
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7] transition-all shrink-0">
              Hobi
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7] transition-all shrink-0">
              Keagamaan
            </button>
            <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7] transition-all shrink-0">
              Lainnya
            </button>
          </div>
        </div>

        {/* Main Content - Events Grid */}
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 pb-20 pt-6">
          {upcomingEvents.length > 0 ? (
            <section className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ) : null}

          

          {sortedEvents.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-gray-900">Belum ada event yang ditemukan</p>
              <p className="mt-1 text-sm text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
