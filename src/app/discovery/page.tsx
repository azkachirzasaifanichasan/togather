"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Area, InterestCategory } from "@prisma/client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Map, YOGYAKARTA_CENTER, type MapMarker } from "@/components/Map";
import { FilterBar, type LocationState } from "@/components/Sidebar/FilterBar";

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
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationState("granted");
      },
      () => setLocationState("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header navbar terpisah di atas */}
      <Header />

      <div className="mx-auto flex w-full max-w-[1500px] flex-1 gap-8 px-6 py-8">
        {/* Sidebar kiri */}
        <aside className="hidden w-80 flex-shrink-0 lg:block">
          <div className="space-y-5">
            {/* User Profile Card */}
            <Link
              href={me !== null ? "/profile" : "/login"}
              className="block cursor-pointer rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {me?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={me.avatarUrl}
                      alt={me.name}
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#7960D7] font-bold text-white">
                      {me ? me.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="truncate font-medium text-[#1F2937]">
                      {me === undefined ? "" : me ? me.name : "Masuk / Daftar"}
                    </span>
                    {me !== null && (
                      <span className="text-xs text-[#6B7280]">View profile</span>
                    )}
                  </div>
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Doing | Saved Section */}
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between bg-[#7960D7] px-5 py-3 text-white">
                <div className="flex gap-4">
                  <span className="border-b-2 border-white pb-0.5 font-semibold">Doing</span>
                  <span className="opacity-50">|</span>
                  <span className="font-semibold opacity-70">Saved</span>
                </div>
                <Link href="/event" className="text-sm hover:underline">
                  See all
                </Link>
              </div>

              <div className="px-5 py-8 text-center">
                <p className="mb-4 text-sm text-[#6B7280]">Looks like you&apos;re free</p>
                <Link
                  href="/event"
                  className="inline-block rounded-full bg-[#1F2937] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#111827]"
                >
                  Find events
                </Link>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              selectedCategories={selectedCategories}
              selectedArea={selectedArea}
              onCategoriesChange={setSelectedCategories}
              onAreaChange={handleAreaChange}
              radius={radius}
              onRadiusChange={setRadius}
              locationState={locationState}
              onRequestLocation={requestLocation}
            />

            {/* Community Section */}
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-[#1F2937]">Community</h3>
                <Link href="/komunitas" className="text-sm text-[#7960D7] hover:underline">
                  See all
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : communities.length > 0 ? (
                <div className="space-y-3">
                  {communities.slice(0, 5).map((community) => (
                    <Link
                      key={community.id}
                      href={`/komunitas/${community.id}`}
                      className="block rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#7960D7] font-bold text-white">
                          {community.name?.charAt(0) || "C"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-medium text-[#1F2937]">
                            {community.name}
                          </h4>
                          <p className="mt-0.5 line-clamp-2 text-xs text-[#6B7280]">
                            {community.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-[#6B7280]">
                            <span>{community.memberCount || 0} members</span>
                            {community.area && (
                              <>
                                <span>•</span>
                                <span>{community.area}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="mb-2 text-sm font-medium text-[#1F2937]">Find your people!</p>
                  <p className="mb-4 text-xs text-[#9CA3AF]">
                    Groups that share your passions and keep you connected IRL.
                  </p>
                  <Link
                    href="/komunitas"
                    className="inline-block w-full rounded-full bg-[#1F2937] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#111827]"
                  >
                    Explore community
                  </Link>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-[#1F2937]">Discovery</h1>

            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6B7280]">
                {loading
                  ? "Memuat peta..."
                  : `${communities.length} komunitas · ${events.length} event`}
              </span>
              {error && <span className="text-xs text-red-600">{error}</span>}
              <button
                type="button"
                onClick={refresh}
                className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-[#1F2937] transition-colors hover:bg-gray-50"
              >
                Muat ulang
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative h-[620px] w-full overflow-hidden rounded-2xl border border-gray-200">
            <Map center={mapCenter} markers={markers} />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
