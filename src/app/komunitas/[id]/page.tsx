"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CommunityDetailPage() {
  const params = useParams();
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/communities/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCommunity(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[--color-muted]">Memuat...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-[--color-dark] mb-2">Komunitas tidak ditemukan</p>
          <a href="/" className="text-[--color-primary] hover:underline">Kembali ke Beranda</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <a href="/" className="text-[--color-primary] hover:underline">← Kembali</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[--color-panel] rounded-[--radius-panel] p-8 mb-6">
          <h1 className="text-3xl font-bold text-[--color-dark] mb-4">{community.name}</h1>
          <p className="text-[--color-muted] mb-6">{community.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[--color-primary] text-white rounded-[--radius-card] p-4 text-center">
              <div className="text-2xl font-bold">{community._count.members}</div>
              <div className="text-sm">Anggota</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-[--radius-card] p-4 text-center">
              <div className="text-2xl font-bold text-[--color-dark]">{community.type === "ONLINE" ? "Online" : "Offline"}</div>
              <div className="text-sm text-[--color-muted]">Tipe</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-[--radius-card] p-4 text-center">
              <div className="text-2xl font-bold text-[--color-dark]">{community.accessType === "PUBLIC" ? "Publik" : "Privat"}</div>
              <div className="text-sm text-[--color-muted]">Akses</div>
            </div>
          </div>

          {community.isMember ? (
            <button className="w-full px-6 py-3 rounded-[--radius-pill] bg-gray-300 text-[--color-dark] font-medium">
              Sudah Bergabung
            </button>
          ) : community.accessType === "PRIVATE" && community.joinRequestStatus === "PENDING" ? (
            <button className="w-full px-6 py-3 rounded-[--radius-pill] bg-gray-300 text-[--color-dark] font-medium">
              Menunggu Persetujuan
            </button>
          ) : (
            <button 
              onClick={() => alert("Fitur join memerlukan login. Implementasi lengkap di route handler dengan auth.")}
              className="w-full px-6 py-3 rounded-[--radius-pill] bg-[--color-dark] text-white font-medium hover:opacity-90"
            >
              {community.accessType === "PUBLIC" ? "Gabung" : "Minta Bergabung"}
            </button>
          )}

          {community.dataSource === "REFERENCE_UNVERIFIED" && (
            <p className="mt-4 text-xs text-[--color-muted] text-center">
              📌 Data referensi — belum diverifikasi
            </p>
          )}
        </div>

        {community.location && (
          <div className="bg-[--color-panel] rounded-[--radius-card] p-6">
            <h2 className="font-bold text-[--color-dark] mb-3">Lokasi</h2>
            <p className="text-[--color-dark]">
              {community.type === "ONLINE" || community.location.isOnline
                ? "Komunitas online / tidak ada lokasi fisik"
                : community.location.addressText || community.location.area || "Lokasi umum"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
