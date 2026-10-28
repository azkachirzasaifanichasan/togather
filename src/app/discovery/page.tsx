"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Map } from "@/components/Map";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InterestCategory, Area } from "@prisma/client";
import dynamic from "next/dynamic";

// Import sidebar components
import { Logo } from "@/components/Sidebar/Logo";
import { SearchBar } from "@/components/Sidebar/SearchBar";
import { LocationDisplay } from "@/components/Sidebar/LocationDisplay";
import { FilterBar } from "@/components/Sidebar/FilterBar";

export default function DiscoveryPage() {
  const searchParams = useSearchParams();
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<InterestCategory[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<Area[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      selectedCategories.forEach((cat) => params.append("categories", cat));
      selectedAreas.forEach((area) => params.append("area", area));

      const [commRes, eventRes] = await Promise.all([
        fetch(`/api/communities?${params}`),
        fetch(`/api/events?${params}`),
      ]);

      const commData = await commRes.json();
      const eventData = await eventRes.json();

      setCommunities(Array.isArray(commData.communities) ? commData.communities : []);
      setEvents(Array.isArray(eventData.events) ? eventData.events : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setCommunities([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategories, selectedAreas]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markers = [
    ...communities
      .filter((c) => c.latitude && c.longitude)
      .map((c) => ({
        id: c.id,
        position: [c.latitude, c.longitude] as [number, number],
        type: "community" as const,
        name: c.name,
        description: c.description,
        category: c.categories?.[0],
        memberCount: c.memberCount,
        onClick: () => window.location.href = `/komunitas/${c.id}`,
      })),
    ...events
      .filter((e) => e.latitude && e.longitude)
      .map((e) => ({
        id: e.id,
        position: [e.latitude, e.longitude] as [number, number],
        type: "event" as const,
        name: e.title,
        description: e.description,
        category: e.category,
        onClick: () => window.location.href = `/event/${e.id}`,
      })),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Fixed Header Section */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <Logo />
          <SearchBar onSearch={setSearchQuery} />
          <LocationDisplay />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* User Profile Card - Authenticated State */}
            <Link href="/profile" className="block bg-gray-50 rounded-xl p-4 hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#7960D7] rounded-full flex items-center justify-center text-white font-bold">
                    U
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-[#1F2937]">User</span>
                    <span className="text-xs text-[#6B7280]">View profile</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Doing | Saved Section */}
            <div className="bg-[#7960D7] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-4">
                  <span className="font-semibold border-b-2 border-white pb-1">Doing</span>
                  <span className="opacity-50">|</span>
                  <span className="font-semibold opacity-70">Saved</span>
                </div>
                <button className="text-sm hover:underline">See all</button>
              </div>
              
              <div className="text-center py-6">
                <p className="text-white/90 mb-4">Looks like you're free</p>
                <Link
                  href="/event"
                  className="inline-block bg-[#1F2937] hover:bg-[#111827] text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Find events
                </Link>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              selectedCategories={selectedCategories}
              selectedAreas={selectedAreas}
              onCategoriesChange={setSelectedCategories}
              onAreasChange={setSelectedAreas}
            />

            {/* Community Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1F2937]">Community</h3>
                <Link href="/komunitas" className="text-sm text-[#7960D7] hover:underline">
                  See all
                </Link>
              </div>

              {communities.length > 0 ? (
                <div className="space-y-3">
                  {communities.slice(0, 5).map((community) => (
                    <Link
                      key={community.id}
                      href={`/komunitas/${community.id}`}
                      className="block bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#7960D7] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {community.name?.charAt(0) || "C"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[#1F2937] truncate">
                            {community.name}
                          </h4>
                          <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                            {community.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-[#6B7280]">
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
                <div className="text-center py-8">
                  <p className="text-sm text-[#6B7280] mb-4">Find your people!</p>
                  <p className="text-xs text-[#9CA3AF] mb-4">
                    Groups that share your passions and keep you connected IRL.
                  </p>
                  <Link
                    href="/komunitas"
                    className="inline-block w-full bg-[#1F2937] hover:bg-[#111827] text-white px-4 py-2.5 rounded-full text-sm font-medium transition-colors"
                  >
                    Explore community
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#1F2937]">Discovery</h1>
            
            <div className="flex items-center gap-4">
              <Link href="/" className="px-6 py-2 bg-[#7960D7] text-white rounded-full font-medium hover:bg-[#6950c7] transition-colors">
                Home
              </Link>
              <Link href="/komunitas" className="px-6 py-2 text-[#1F2937] hover:bg-gray-50 rounded-full font-medium transition-colors">
                Community
              </Link>
              <Link href="/event" className="px-6 py-2 text-[#1F2937] hover:bg-gray-50 rounded-full font-medium transition-colors">
                Event
              </Link>
              
              <div className="flex items-center gap-3 ml-4">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <Link href="/profile">
                  <div className="w-8 h-8 bg-[#7960D7] rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:bg-[#6950c7] transition-colors">
                    U
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Map Container */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#7960D7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#6B7280]">Memuat peta...</p>
              </div>
            </div>
          ) : (
            <Map markers={markers} />
          )}
        </div>
      </main>
      </div>
      <Footer />
    </div>
  );
}
