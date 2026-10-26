"use client";

import { useState, useEffect } from "react";
import { Map } from "@/components/Map";
import { InterestCategory, Area } from "@prisma/client";

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

export default function DiscoveryPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<InterestCategory[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategories, selectedArea]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selectedCategories.forEach((cat) => params.append("categories", cat));
      if (selectedArea) params.append("area", selectedArea);

      const [commRes, eventRes] = await Promise.all([
        fetch(`/api/communities?${params}`),
        fetch(`/api/events?${params}`),
      ]);

      const commData = await commRes.json();
      const eventData = await eventRes.json();

      setCommunities(commData);
      setEvents(eventData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const markers = [
    ...communities
      .filter((c) => c.location?.coordinates)
      .map((c) => ({
        id: c.id,
        position: [
          c.location.coordinates.coordinates[1],
          c.location.coordinates.coordinates[0],
        ] as [number, number],
        type: "community" as const,
        name: c.name,
        onClick: () => window.location.href = `/komunitas/${c.id}`,
      })),
    ...events
      .filter((e) => e.coordinates)
      .map((e) => ({
        id: e.id,
        position: [
          e.coordinates.coordinates[1],
          e.coordinates.coordinates[0],
        ] as [number, number],
        type: "event" as const,
        name: e.name,
        onClick: () => window.location.href = `/event/${e.id}`,
      })),
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo-togather.png" alt="Togather" className="h-10" />
            <span className="text-xl font-bold text-[--color-dark]">Togather</span>
          </div>
          <nav className="flex gap-2">
            <a href="/" className="px-6 py-2 rounded-[--radius-pill] bg-[--color-primary] text-white font-medium shadow-sm">
              Beranda
            </a>
            <a href="/komunitas" className="px-6 py-2 rounded-[--radius-pill] border border-gray-300 text-[--color-dark] font-medium">
              Komunitas
            </a>
            <a href="/event" className="px-6 py-2 rounded-[--radius-pill] border border-gray-300 text-[--color-dark] font-medium">
              Event
            </a>
          </nav>
          <div>
            <a href="/login" className="px-6 py-2 rounded-[--radius-pill] bg-[--color-dark] text-white font-medium">
              Masuk
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[--color-dark] mb-6">Jelajah</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-[--color-panel] rounded-[--radius-card] p-6">
              <h2 className="font-bold text-[--color-dark] mb-4">Filter</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[--color-dark] mb-2">
                    Kategori Minat
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(INTEREST_LABELS).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(key as InterestCategory)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, key as InterestCategory]);
                            } else {
                              setSelectedCategories(selectedCategories.filter((c) => c !== key));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-[--color-dark]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[--color-dark] mb-2">
                    Wilayah
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value as Area | "")}
                    className="w-full px-4 py-2 rounded-[--radius-pill] border border-gray-300"
                  >
                    <option value="">Semua Wilayah</option>
                    {Object.entries(AREA_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedArea("");
                  }}
                  className="w-full px-4 py-2 rounded-[--radius-pill] border border-gray-300 text-[--color-dark] text-sm"
                >
                  Reset Filter
                </button>
              </div>
            </div>

            <div className="bg-[--color-panel] rounded-[--radius-card] p-6">
              <h3 className="font-bold text-[--color-dark] mb-4">Legenda</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[--color-primary] border-2 border-white shadow"></div>
                  <span className="text-sm text-[--color-dark]">Komunitas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[--color-dark] border-2 border-white shadow"></div>
                  <span className="text-sm text-[--color-dark]">Event</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[--radius-panel] border border-gray-200 overflow-hidden" style={{ height: "600px" }}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-[--color-muted]">Memuat...</p>
                </div>
              ) : (
                <Map markers={markers} />
              )}
            </div>

            {!loading && markers.length === 0 && (
              <div className="mt-6 text-center py-12 bg-[--color-panel] rounded-[--radius-card]">
                <p className="text-lg font-medium text-[--color-dark] mb-2">
                  Tidak ada hasil ditemukan
                </p>
                <p className="text-[--color-muted]">
                  Coba sesuaikan filter atau reset untuk melihat semua komunitas dan event.
                </p>
              </div>
            )}

            {/* Nearby List */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              {communities.slice(0, 6).map((comm) => (
                <a
                  key={comm.id}
                  href={`/komunitas/${comm.id}`}
                  className="block p-4 bg-[--color-panel] rounded-[--radius-card] hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-[--color-dark] mb-1">{comm.name}</h3>
                  <p className="text-sm text-[--color-muted] mb-2 line-clamp-2">
                    {comm.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[--color-muted]">
                    <span>{comm._count.members} anggota</span>
                    <span>•</span>
                    <span>{comm.type === "ONLINE" ? "Online" : comm.location?.area || "Offline"}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
