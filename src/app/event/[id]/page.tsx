"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-[--color-dark] mb-2">Event tidak ditemukan</p>
          <a href="/" className="text-[--color-primary] hover:underline">Kembali ke Beranda</a>
        </div>
      </div>
    );
  }

  const statusBadge = {
    MENDATANG: "bg-green-100 text-green-800",
    BERLANGSUNG: "bg-blue-100 text-blue-800",
    SELESAI: "bg-gray-100 text-gray-800",
  }[event.status];

  const isFull = event.quota && event._count.registrations >= event.quota;
  const canRegister = event.registrationOpen && event.status !== "SELESAI" && !isFull;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <a href="/" className="text-[--color-primary] hover:underline">← Kembali</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[--color-panel] rounded-[--radius-panel] p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-[--color-dark]">{event.name}</h1>
            <span className={`px-4 py-2 rounded-[--radius-pill] text-sm font-medium ${statusBadge}`}>
              {event.status}
            </span>
          </div>

          <p className="text-[--color-muted] mb-6">{event.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-[--color-muted] mb-1">📅 Tanggal</p>
              <p className="text-[--color-dark] font-medium">
                {new Date(event.startDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-[--color-muted] mb-1">⏰ Waktu</p>
              <p className="text-[--color-dark] font-medium">{event.startTime || "Waktu belum diumumkan"}</p>
            </div>
            <div>
              <p className="text-[--color-muted] mb-1">📍 Lokasi</p>
              <p className="text-[--color-dark] font-medium">{event.venue || event.area || "Lokasi TBA"}</p>
            </div>
            <div>
              <p className="text-[--color-muted] mb-1">👥 Kuota</p>
              <p className="text-[--color-dark] font-medium">
                {event.quota ? `${event._count.registrations} / ${event.quota}` : "Tidak terbatas"}
              </p>
            </div>
            <div>
              <p className="text-[--color-muted] mb-1">💰 Biaya</p>
              <p className="text-[--color-dark] font-medium">{event.fee || "Gratis"}</p>
            </div>
            <div>
              <p className="text-[--color-muted] mb-1">📞 Kontak</p>
              <p className="text-[--color-dark] font-medium">{event.contactInfo || event.organizer}</p>
            </div>
          </div>

          {event.isRegistered ? (
            <button className="w-full px-6 py-3 rounded-[--radius-pill] bg-gray-300 text-[--color-dark] font-medium">
              Sudah Terdaftar
            </button>
          ) : canRegister ? (
            <button 
              onClick={() => alert("Fitur registrasi memerlukan login. Implementasi lengkap di route handler dengan auth.")}
              className="w-full px-6 py-3 rounded-[--radius-pill] bg-[--color-dark] text-white font-medium hover:opacity-90"
            >
              Daftar Event
            </button>
          ) : isFull ? (
            <button className="w-full px-6 py-3 rounded-[--radius-pill] bg-gray-300 text-[--color-dark] font-medium cursor-not-allowed">
              Kuota Penuh
            </button>
          ) : !event.registrationOpen ? (
            <button className="w-full px-6 py-3 rounded-[--radius-pill] bg-gray-300 text-[--color-dark] font-medium cursor-not-allowed">
              Pendaftaran Ditutup
            </button>
          ) : (
            <button className="w-full px-6 py-3 rounded-[--radius-pill] bg-gray-300 text-[--color-dark] font-medium cursor-not-allowed">
              Event Selesai
            </button>
          )}

          {event.dataSource === "REFERENCE_UNVERIFIED" && (
            <p className="mt-4 text-xs text-[--color-muted] text-center">
              📌 Data referensi — belum diverifikasi
            </p>
          )}

          {event.externalLink && (
            <p className="mt-4 text-sm text-center">
              <a href={event.externalLink} target="_blank" rel="noopener noreferrer" className="text-[--color-primary] hover:underline">
                Tautan sumber eksternal
              </a>
            </p>
          )}
        </div>

        {event.relatedCommunities?.length > 0 && (
          <div className="bg-[--color-panel] rounded-[--radius-card] p-6">
            <h2 className="font-bold text-[--color-dark] mb-3">Komunitas Terkait</h2>
            {event.relatedCommunities.map((rc: any) => (
              <a
                key={rc.community.id}
                href={`/komunitas/${rc.community.id}`}
                className="block text-[--color-primary] hover:underline"
              >
                {rc.community.name}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
