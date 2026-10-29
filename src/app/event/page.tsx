import { auth } from "@/lib/auth";
import { getUserEventRegistrations } from "@/server/events";
import { getUpcomingEvents } from "@/server/events";
import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const TABS = [
  { key: "going", label: "Akan datang" },
  { key: "past", label: "Riwayat" },
  { key: "saved", label: "Disimpan" },
] as const;

export default async function EventPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const { tab } = await searchParams;
  const activeTab = TABS.some((item) => item.key === tab) ? (tab as string) : "going";

  // Untuk user login: events yang mereka daftar
  const goingRegistrations = session
    ? await getUserEventRegistrations(session.user.id, "TERDAFTAR")
    : [];
  const pastRegistrations = session
    ? await getUserEventRegistrations(session.user.id, "RIWAYAT")
    : [];

  const goingEvents = goingRegistrations.map((r) => r.event);
  const pastEvents = pastRegistrations.map((r) => r.event);

  // Untuk guest: upcoming events dari API
  const upcomingEvents = session ? [] : await getUpcomingEvents();

  // Tentukan events yang akan ditampilkan
  let currentEvents = [];
  let isGuestView = false;
  
  if (!session) {
    // Guest: tampilkan upcoming events
    isGuestView = true;
    currentEvents = upcomingEvents;
  } else {
    // User login: tampilkan sesuai tab
    currentEvents = activeTab === "going" ? goingEvents : activeTab === "past" ? pastEvents : [];
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {session ? "Event kamu" : "Upcoming Events"}
            </h1>
            <p className="mt-2 text-gray-600">
              {session
                ? `${goingEvents.length} event akan datang · ${pastEvents.length} riwayat`
                : `Temukan ${upcomingEvents.length} event menarik di sekitar Anda`}
            </p>
          </div>
          <Link
            href="/discovery"
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
          >
            Cari event baru
          </Link>
        </div>

        {/* Tabs hanya untuk user login */}
        {session && (
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
        )}

        {isGuestView ? (
          // Guest view: tampilkan upcoming events
          currentEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Belum ada event</h2>
              <p className="mx-auto mb-6 max-w-md text-gray-600">
                Saat ini belum ada event yang akan datang. Coba lagi nanti.
              </p>
              <Link
                href="/discovery"
                className="inline-block rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Jelajahi event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {currentEvents.map((event) => {
                const eventDate = new Date(event.startDate);
                const day = eventDate.getDate();
                const month = eventDate
                  .toLocaleString("id-ID", { month: "short" })
                  .toUpperCase();

                return (
                  <Link key={event.id} href={`/event/${event.id}`} className="group block">
                    <div className="flex gap-5 rounded-xl border border-gray-200 p-5 transition-shadow hover:shadow-lg">
                      <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-[#7960D7]">
                        <span className="text-2xl font-bold text-white">{day}</span>
                        <span className="text-xs text-purple-100">{month}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#7960D7]">
                          {event.name}
                        </h3>
                        <p className="mb-2 line-clamp-2 text-sm text-gray-600">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span>{event.startTime || "Waktu TBA"}</span>
                          <span>{event.venue || event.area?.replaceAll("_", " ") || "Lokasi TBA"}</span>
                          {event.relatedCommunities[0] && (
                            <span>{event.relatedCommunities[0].name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : currentEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {activeTab === "saved"
                ? "Fitur simpan belum tersedia"
                : activeTab === "past"
                  ? "Belum ada riwayat event"
                  : "Belum ada rencana"}
            </h2>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              {activeTab === "saved"
                ? "Bookmark event akan hadir di pembaruan berikutnya. Sementara itu, jelajahi event lewat peta."
                : "Temukan event yang menarik dan daftar dalam satu klik."}
            </p>
            <Link
              href="/discovery"
              className="inline-block rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Jelajahi event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentEvents.map((event) => {
              const eventDate = new Date(event.startDate);
              const day = eventDate.getDate();
              const month = eventDate
                .toLocaleString("id-ID", { month: "short" })
                .toUpperCase();

              return (
                <Link key={event.id} href={`/event/${event.id}`} className="group block">
                  <div className="flex gap-5 rounded-xl border border-gray-200 p-5 transition-shadow hover:shadow-lg">
                    <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-[#7960D7]">
                      <span className="text-2xl font-bold text-white">{day}</span>
                      <span className="text-xs text-purple-100">{month}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#7960D7]">
                        {event.name}
                      </h3>
                      <p className="mb-2 line-clamp-2 text-sm text-gray-600">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span>{event.startTime || "Waktu TBA"}</span>
                        <span>{event.venue || event.area?.replaceAll("_", " ") || "Lokasi TBA"}</span>
                        {event.relatedCommunities[0] && (
                          <span>{event.relatedCommunities[0].name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
