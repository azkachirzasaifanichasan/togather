import { auth } from "@/lib/auth";
import { getUpcomingEvents } from "@/server/events";
import type { EventSummary } from "@/server/events";
import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/events/EventCard";

const TABS = [
  { key: "all", label: "Semua Events" },
  { key: "saved", label: "Disimpan" },
] as const;

export default async function EventPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const { tab } = await searchParams;
  const activeTab = TABS.some((item) => item.key === tab) ? (tab as string) : "all";

  // Ambil semua events untuk semua users
  const allEvents = await getUpcomingEvents();

  // Tentukan events yang akan ditampilkan
  let currentEvents: EventSummary[] = [];
  
  if (activeTab === "all") {
    // Tab "Semua Events" - untuk semua users
    currentEvents = allEvents;
  } else {
    // Tab "Disimpan" - belum tersedia
    currentEvents = [];
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Events
            </h1>
            <p className="mt-2 text-gray-600">
              {activeTab === "all" 
                ? `Temukan ${allEvents.length} event di sekitar Anda`
                : "Bookmark event akan tersedia di fase berikutnya"}
            </p>
          </div>
          <Link
            href="/discovery"
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
          >
            Cari event baru
          </Link>
        </div>

        {/* Tabs untuk semua user */}
        <div className="mb-8 flex items-center gap-2 border-b border-gray-200">
          {TABS.map((item) => (
            <Link
              key={item.key}
              href={`/event?tab=${item.key}`}
              className={`-mb-px rounded-t-lg px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === item.key
                  ? "bg-[#7960D7] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {activeTab === "all" ? (
          // Tab "Semua Events"
          currentEvents.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Belum ada events saat ini</h3>
              <p className="mb-6 text-gray-600 max-w-md mx-auto">
                Events akan muncul di sini saat komunitas mulai mengadakan acara. Coba lagi nanti atau jelajahi komunitas terlebih dahulu.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/discovery" className="rounded-lg bg-[#7960D7] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6950c7]">
                  Explore Communities
                </Link>
                <button className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                  <div className="text-xl font-bold text-[#7960D7]">{currentEvents.length}</div>
                  <div className="text-xs text-gray-600">Total Events</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                  <div className="text-xl font-bold text-green-600">
                    {currentEvents.filter(e => e.quota || e.fee).length}
                  </div>
                  <div className="text-xs text-gray-600">Interactive</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {currentEvents.filter(e => !e.quota && !e.fee).length}
                  </div>
                  <div className="text-xs text-gray-600">Informational</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                  <div className="text-xl font-bold text-orange-600">
                    {currentEvents.filter(e => !e.fee || e.fee === "Gratis").length}
                  </div>
                  <div className="text-xs text-gray-600">Free Events</div>
                </div>
              </div>

              {/* Interactive Events Section */}
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Interactive Events</h3>
                    <p className="text-sm text-gray-600">Events dengan tiket, kuota, dan sistem pendaftaran</p>
                  </div>
                  <Link href="/event?type=interactive" className="text-sm font-medium text-[#7960D7] hover:text-[#6950c7]">
                    Lihat semua →
                  </Link>
                </div>
                
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {currentEvents
                    .filter(event => event.quota || event.fee)
                    .slice(0, 6)
                    .map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        type="INTERACTIVE"
                        showPreview={true}
                      />
                    ))}
                </div>
                
                {currentEvents.filter(event => event.quota || event.fee).length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <p className="text-gray-600">Belum ada interactive events saat ini</p>
                  </div>
                )}
              </div>

              {/* Informational Events Section */}
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Info & Workshop</h3>
                    <p className="text-sm text-gray-600">Seminar, workshop, dan event informasi lainnya</p>
                  </div>
                  <Link href="/event?type=informational" className="text-sm font-medium text-[#7960D7] hover:text-[#6950c7]">
                    Lihat semua →
                  </Link>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  {currentEvents
                    .filter(event => !event.quota && !event.fee)
                    .slice(0, 5)
                    .map((event) => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        type="INFORMATIONAL"
                        showPreview={true}
                      />
                    ))}
                </div>
                
                {currentEvents.filter(event => !event.quota && !event.fee).length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <p className="text-gray-600">Belum ada informational events saat ini</p>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          // Tab "Disimpan" - placeholder
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7960D7]/10">
              <svg className="h-8 w-8 text-[#7960D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Fitur Disimpan Segera Hadir</h2>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              Bookmark event favorit Anda akan tersedia di fase pengembangan berikutnya.
            </p>
            <Link
              href="/event?tab=all"
              className="inline-block rounded-lg bg-[#7960D7] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6950c7]"
            >
              Lihat Semua Events
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
