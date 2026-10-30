"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Area, InterestCategory } from "@prisma/client";

interface EventData {
  id: string;
  name: string;
  description: string;
  startDate: string;
  startTime?: string | null;
  venue?: string | null;
  area?: Area | null;
  category?: InterestCategory;
  quota?: number | null;
  fee?: string | null;
  organizer?: string | null;
  _count?: { registrations?: number };
  relatedCommunities?: Array<{ id: string; name: string }>;
}

const AREA_LABELS: Record<Area, string> = {
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
  SLEMAN: "Sleman",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  GUNUNGKIDUL: "Gunungkidul",
};

const CATEGORY_LABELS: Record<InterestCategory, string> = {
  OLAHRAGA: "Olahraga",
  TEKNOLOGI: "Teknologi",
  PENDIDIKAN: "Pendidikan",
  SENI_DAN_HIBURAN: "Seni & Hiburan",
  SOSIAL: "Sosial",
  LINGKUNGAN: "Lingkungan",
  BISNIS_DAN_KARIER: "Bisnis & Karier",
  HOBI: "Hobi",
  KEAGAMAAN: "Keagamaan",
  LAINNYA: "Lainnya",
};

export default function EventsPageNew() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<InterestCategory[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, upcoming, past

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        selectedCategories.forEach(cat => params.append("categories", cat));
        if (selectedArea) params.set("area", selectedArea);
        
        if (dateFilter === "upcoming") {
          params.set("status", "MENDATANG");
        } else if (dateFilter === "past") {
          params.set("status", "SELESAI");
        }

        const response = await fetch(`/api/events?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setEvents(data.events || []);
        } else {
          setError("Gagal memuat data events");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, selectedCategories, selectedArea, dateFilter]);

  const handleCategoryToggle = (category: InterestCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedArea(null);
    setSearchQuery("");
    setDateFilter("all");
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedArea || searchQuery || dateFilter !== "all";

  // Get event type (interactive or informational)
  const getEventType = (event: EventData) => {
    return event.quota || event.fee ? "interactive" : "informational";
  };

  // Format price
  const formatPrice = (fee: string | null | undefined) => {
    if (!fee || fee === "Gratis") return "Gratis";
    const price = fee.replace(/[^\d]/g, "");
    return price ? `Rp ${parseInt(price).toLocaleString("id-ID")}` : "Gratis";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Temukan Event Terbaik di Yogyakarta
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-purple-100">
              Jelajahi ratusan event menarik dari komunitas dan organisasi terpercaya
            </p>
            
            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari event, komunitas, atau topik..."
                  className="block w-full rounded-full border-0 bg-white/10 py-3 pl-10 pr-4 text-white placeholder:text-gray-300 focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filter</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#7960D7] hover:text-[#6950c7]"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Date Filter */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-900">Waktu</h3>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "Semua Event" },
                    { value: "upcoming", label: "Akan Datang" },
                    { value: "past", label: "Sudah Lewat" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="dateFilter"
                        value={option.value}
                        checked={dateFilter === option.value}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="h-4 w-4 text-[#7960D7]"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Area Filter */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-900">Area</h3>
                <div className="space-y-2">
                  {Object.entries(AREA_LABELS).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="areaFilter"
                        value={key}
                        checked={selectedArea === key}
                        onChange={(e) => setSelectedArea(e.target.value as Area)}
                        className="h-4 w-4 text-[#7960D7]"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-900">Kategori</h3>
                <div className="space-y-2">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(key as InterestCategory)}
                        onChange={() => handleCategoryToggle(key as InterestCategory)}
                        className="h-4 w-4 rounded border-gray-300 text-[#7960D7] focus:ring-[#7960D7]"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-900">Statistik</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Events</span>
                    <span className="font-medium text-gray-900">{events.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Event Interaktif</span>
                    <span className="font-medium text-gray-900">
                      {events.filter(e => e.quota || e.fee).length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Event Gratis</span>
                    <span className="font-medium text-gray-900">
                      {events.filter(e => !e.fee || e.fee === "Gratis").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery ? `Hasil pencarian "${searchQuery}"` : "Semua Event"}
                </h2>
                <p className="text-gray-600">
                  {events.length} event ditemukan
                  {selectedArea && ` di ${AREA_LABELS[selectedArea]}`}
                  {selectedCategories.length > 0 && ` dengan kategori ${selectedCategories.map(c => CATEGORY_LABELS[c]).join(", ")}`}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Sort by: Terbaru
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-200"></div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Gagal memuat events</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && events.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Belum ada event</h3>
                <p className="mb-6 text-gray-600">Coba ubah filter pencarian atau coba lagi nanti</p>
                <button
                  onClick={clearFilters}
                  className="rounded-lg bg-[#7960D7] px-6 py-3 font-semibold text-white hover:bg-[#6950c7]"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {/* Events Grid */}
            {!loading && !error && events.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const eventType = getEventType(event);
                  const eventDate = new Date(event.startDate);
                  const day = eventDate.getDate();
                  const month = eventDate.toLocaleString("id-ID", { month: "short" }).toUpperCase();
                  const attendees = event._count?.registrations || 0;
                  const isInteractive = eventType === "interactive";

                  return (
                    <Link key={event.id} href={`/event/${event.id}`} className="group block">
                      <div className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg">
                        {/* Event Image Placeholder */}
                        <div className="relative h-48 bg-gradient-to-r from-purple-400 to-blue-400">
                          {isInteractive && (
                            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1">
                              <span className="text-xs font-medium text-[#7960D7]">
                                {event.fee ? formatPrice(event.fee) : "Gratis"}
                              </span>
                            </div>
                          )}
                          <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1">
                            <span className="text-xs font-medium text-white">
                              {event.area ? AREA_LABELS[event.area] : "Online"}
                            </span>
                          </div>
                          
                          {/* Date Badge */}
                          <div className="absolute bottom-0 left-0 bg-white/95 p-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{day}</div>
                              <div className="text-xs font-medium text-gray-600">{month}</div>
                            </div>
                          </div>
                        </div>

                        {/* Event Content */}
                        <div className="p-5">
                          <div className="mb-3">
                            <h3 className="mb-1 text-lg font-bold text-gray-900 group-hover:text-[#7960D7] line-clamp-2">
                              {event.name}
                            </h3>
                            {event.category && (
                              <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                {CATEGORY_LABELS[event.category]}
                              </span>
                            )}
                          </div>

                          <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                            {event.description}
                          </p>

                          {/* Event Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{event.startTime || "Waktu TBA"}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="line-clamp-1">
                                {event.venue || event.area?.replaceAll("_", " ") || "Online"}
                              </span>
                            </div>
                          </div>

                          {/* Interactive Features */}
                          {isInteractive && (
                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                              <div className="rounded-lg bg-gray-50 p-2 text-center">
                                <div className="font-medium text-gray-900">{attendees}</div>
                                <div className="text-xs text-gray-600">Peserta</div>
                              </div>
                              <div className="rounded-lg bg-gray-50 p-2 text-center">
                                <div className="font-medium text-gray-900">
                                  {event.quota ? `${attendees}/${event.quota}` : "Unlimited"}
                                </div>
                                <div className="text-xs text-gray-600">Kuota</div>
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <button className="mt-4 w-full rounded-lg bg-[#7960D7] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6950c7]">
                            {isInteractive ? "Lihat Detail & Daftar" : "Lihat Detail"}
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && events.length > 0 && (
              <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-8">
                <div className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">1-{Math.min(events.length, 12)}</span> dari{" "}
                  <span className="font-medium">{events.length}</span> event
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    Previous
                  </button>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-12 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 p-8 text-center">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Ingin membuat event Anda sendiri?</h3>
              <p className="mb-6 text-gray-600">
                Bergabung dengan komunitas Togather dan buat event yang akan dihadiri ratusan orang
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="rounded-lg bg-[#7960D7] px-6 py-3 font-semibold text-white hover:bg-[#6950c7]"
                >
                  Buat Event Sekarang
                </Link>
                <Link
                  href="/discovery"
                  className="rounded-lg border border-[#7960D7] px-6 py-3 font-semibold text-[#7960D7] hover:bg-[#7960D7]/5"
                >
                  Lihat Komunitas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
