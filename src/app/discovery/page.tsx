"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Area, InterestCategory } from "@prisma/client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Map, YOGYAKARTA_CENTER, type MapMarker } from "@/components/Map";

interface CommunityResult {
  id: string;
  name: string;
  description: string;
  categories?: InterestCategory[];
  type?: "ONLINE" | "OFFLINE";
  area?: Area | null;
  latitude?: number | null;
  longitude?: number | null;
  memberCount?: number;
}

interface EventResult {
  id: string;
  title: string;
  name?: string;
  description: string;
  category?: InterestCategory;
  venue?: string | null;
  area?: Area | null;
  latitude?: number | null;
  longitude?: number | null;
  attendeeCount?: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const INTEREST_LABELS: Record<InterestCategory, string> = {
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

const AREA_LABELS: Record<Area, string> = {
  KOTA_YOGYAKARTA: "Kota Yogyakarta",
  SLEMAN: "Sleman",
  BANTUL: "Bantul",
  KULON_PROGO: "Kulon Progo",
  GUNUNGKIDUL: "Gunungkidul",
};

type LocationState = "idle" | "loading" | "granted" | "denied" | "unsupported";

export default function DiscoveryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") ?? "";
  const areaParam = searchParams.get("area") ?? "";
  const selectedArea = areaParam ? (areaParam as Area) : null;

  const [communities, setCommunities] = useState<CommunityResult[]>([]);
  const [events, setEvents] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<InterestCategory[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [locationLabel, setLocationLabel] = useState<string>("Yogyakarta, ID");
  const [radius, setRadius] = useState<number | null>(null);

  // undefined = still loading, null = signed out
  const [me, setMe] = useState<
    { name: string; avatarUrl: string | null } | null | undefined
  >(undefined);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setMe(data.user ?? null))
      .catch(() => setMe(null));
  }, []);

  const handleAreaChange = useCallback(
    (area: Area | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (area) {
        params.set("area", area);
      } else {
        params.delete("area");
      }
      const query = params.toString();
      router.replace(`/discovery${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      selectedCategories.forEach((category) => params.append("categories", category));
      if (selectedArea) params.set("area", selectedArea);
      if (userLocation) {
        params.set("lat", String(userLocation.lat));
        params.set("lng", String(userLocation.lng));
        if (radius) params.set("distance", String(radius));
      }

      const query = params.toString();
      const [communitiesRes, eventsRes] = await Promise.all([
        fetch(`/api/communities${query ? `?${query}` : ""}`),
        fetch(`/api/events${query ? `?${query}` : ""}`),
      ]);

      const communitiesData = await communitiesRes.json();
      const eventsData = await eventsRes.json();

      setCommunities(Array.isArray(communitiesData.communities) ? communitiesData.communities : []);
      setEvents(Array.isArray(eventsData.events) ? eventsData.events : []);
      setError(
        communitiesRes.ok && eventsRes.ok
          ? null
          : "Sebagian data gagal dimuat. Coba muat ulang halaman."
      );
    } catch (fetchError) {
      console.error("Failed to fetch discovery data:", fetchError);
      setCommunities([]);
      setEvents([]);
      setError("Gagal memuat data. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategories, selectedArea, userLocation, radius]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchData();
    });
  }, [fetchData]);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationState("unsupported");
      return;
    }

    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationState("granted");

        // Reverse geocode pakai Nominatim (OpenStreetMap, gratis, no key)
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "Accept-Language": "id" } }
        )
          .then((res) => res.json())
          .then((data) => {
            const addr = data?.address ?? {};
            const city =
              addr.city ?? addr.county ?? addr.town ?? addr.village ?? "";
            const province = addr.state ?? addr.region ?? "";
            if (city || province) {
              setLocationLabel([city, province].filter(Boolean).join(", "));
            }
          })
          .catch(() => {/* fallback ke default */});
      },
      () => setLocationState("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  // Auto-request lokasi saat halaman pertama dibuka
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markers = useMemo<MapMarker[]>(() => {
    const communityMarkers: MapMarker[] = communities
      .filter(
        (community) =>
          typeof community.latitude === "number" && typeof community.longitude === "number"
      )
      .map((community) => ({
        id: `community-${community.id}`,
        position: [community.latitude as number, community.longitude as number],
        type: "community" as const,
        name: community.name,
        description: community.description,
        category: community.area ?? undefined,
        href: `/komunitas/${community.id}`,
      }));

    const eventMarkers: MapMarker[] = events
      .filter((event) => typeof event.latitude === "number" && typeof event.longitude === "number")
      .map((event) => ({
        id: `event-${event.id}`,
        position: [event.latitude as number, event.longitude as number],
        type: "event" as const,
        name: event.title ?? event.name ?? "Event",
        description: event.venue ?? event.description,
        category: event.area ?? undefined,
        href: `/event/${event.id}`,
      }));

    const meMarkers: MapMarker[] = userLocation
      ? [
          {
            id: "me",
            position: [userLocation.lat, userLocation.lng],
            type: "me" as const,
            name: "Lokasi kamu",
          },
        ]
      : [];

    return [...meMarkers, ...communityMarkers, ...eventMarkers];
  }, [communities, events, userLocation]);

  const mapCenter = useMemo<[number, number]>(
    () => (userLocation ? [userLocation.lat, userLocation.lng] : YOGYAKARTA_CENTER),
    [userLocation]
  );

  const refresh = () => {
    setLoading(true);
    void fetchData();
  };

  const hasFilters = selectedCategories.length > 0 || selectedArea !== null || radius !== null;

  const clearAll = () => {
    setSelectedCategories([]);
    handleAreaChange(null);
    setRadius(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header
        locationLabel={locationLabel}
        onLocationChange={(label, lat, lon) => {
          setLocationLabel(label);
          setUserLocation({ lat, lng: lon });
        }}
      />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-6 py-6">

        {/* ── Sidebar kiri ── */}
        <aside className="hidden w-72 flex-shrink-0 lg:flex lg:flex-col" style={{ height: "calc(100vh - 80px)", position: "sticky", top: "72px" }}>
          <div className="flex flex-col gap-4 overflow-y-auto">

            {/* Profile card */}
            <Link
              href={me !== null ? "/profile" : "/login"}
              className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                {me?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={me.avatarUrl}
                    alt={me.name}
                    className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#7960D7] text-sm font-bold text-white">
                    {me ? me.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-sm font-semibold text-[#1F2937]">
                    {me === undefined ? "" : me ? me.name : "Masuk / Daftar"}
                  </span>
                  {me && (
                    <span className="text-xs text-[#6B7280]">Yogyakarta</span>
                  )}
                </div>
              </div>
              <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Going | Saved */}
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between bg-[#7960D7] px-4 py-3 text-white">
                <div className="flex gap-3 text-sm font-semibold">
                  <button className="border-b-2 border-white pb-0.5">Going</button>
                  <span className="opacity-40">|</span>
                  <button className="opacity-60 hover:opacity-100 transition-opacity">Saved</button>
                </div>
                <Link href="/event" className="text-xs hover:underline opacity-80">
                  See all
                </Link>
              </div>
              <div className="px-4 py-6 text-center">
                <p className="mb-3 text-sm text-[#6B7280]">Looks like you&apos;re free</p>
                <Link
                  href="/event"
                  className="inline-block rounded-full bg-[#1F2937] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#111827]"
                >
                  Find events
                </Link>
              </div>
            </div>

            {/* Your groups */}
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1F2937]">
                  Your groups
                  {communities.length > 0 && (
                    <span className="ml-1.5 text-xs font-normal text-[#6B7280]">{communities.length}</span>
                  )}
                </h3>
                <Link href="/komunitas" className="text-xs text-[#7960D7] hover:underline">
                  See all
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-gray-100" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                        <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : communities.length > 0 ? (
                <div className="space-y-2">
                  {communities.slice(0, 4).map((community) => (
                    <Link
                      key={community.id}
                      href={`/komunitas/${community.id}`}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#7960D7] text-sm font-bold text-white">
                        {community.name?.charAt(0) || "C"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1F2937]">
                          {community.name}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {community.memberCount || 0} members
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="mb-1 text-sm font-medium text-[#1F2937]">Find your people!</p>
                  <p className="mb-3 text-xs text-[#9CA3AF]">
                    Komunitas sesuai minatmu ada di sini.
                  </p>
                  <Link
                    href="/komunitas"
                    className="inline-block w-full rounded-full bg-[#1F2937] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#111827]"
                  >
                    Explore community
                  </Link>
                </div>
              )}

              {!loading && communities.length > 0 && (
                <Link
                  href="/komunitas"
                  className="mt-3 flex w-full items-center justify-center rounded-full border border-gray-200 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-200 bg-[#1F2937]"
                >
                  Find more groups
                </Link>
              )}
            </div>

          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex min-w-0 flex-1 flex-col gap-4">

          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-[#1F2937]">Discovery</h1>
            <div className="flex items-center gap-2">
              {error && <span className="text-xs text-red-500">{error}</span>}
              {/* Area select */}
              <select
                value={selectedArea ?? ""}
                onChange={(e) => handleAreaChange((e.target.value as Area) || null)}
                className="cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-1.5 pl-3 pr-7 text-sm font-medium text-[#374151] shadow-sm transition-colors hover:border-[#7960D7] focus:outline-none focus:ring-2 focus:ring-[#7960D7]/30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                }}
              >
                <option value="">Semua area</option>
                {Object.entries(AREA_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 bg-white px-1 py-1">

            {/* Kategori — scrollable row */}
            <div className="relative min-w-0 flex-1">
              <div
                className="flex gap-1.5 overflow-x-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {Object.entries(INTEREST_LABELS).map(([key, label]) => {
                  const active = selectedCategories.includes(key as InterestCategory);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        active
                          ? setSelectedCategories(selectedCategories.filter((c) => c !== key))
                          : setSelectedCategories([...selectedCategories, key as InterestCategory])
                      }
                      aria-pressed={active}
                      className={`flex-shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                        active
                          ? "bg-[#7960D7] text-white shadow-sm"
                          : "bg-gray-50 text-[#6B7280] hover:bg-[#EEE9FF] hover:text-[#7960D7]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
            </div>

            {/* Clear — hanya muncul saat ada filter */}
            {hasFilters && (
              <>
                <div className="h-5 w-px flex-shrink-0 bg-gray-200" />
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-400"
                >
                  ✕
                </button>
              </>
            )}

          </div>

          {/* Map */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200" style={{ height: "calc(100vh - 260px)", minHeight: "400px" }}>
            <Map center={mapCenter} markers={markers} />
          </div>

        </main>
      </div>

      <Footer />
    </div>
  );
}
