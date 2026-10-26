"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data);
    };

    getSession();

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
        <p className="text-gray-600">Memuat...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 mb-2">Event tidak ditemukan</p>
          <Link href="/" className="text-[#7960D7] hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const statusBadge = {
    MENDATANG: "bg-green-100 text-green-800",
    BERLANGSUNG: "bg-blue-100 text-blue-800",
    SELESAI: "bg-gray-100 text-gray-800",
  }[event.status as keyof typeof statusBadgeMap] || "bg-gray-100 text-gray-800";

  const statusBadgeMap = {
    MENDATANG: "bg-green-100 text-green-800",
    BERLANGSUNG: "bg-blue-100 text-blue-800",
    SELESAI: "bg-gray-100 text-gray-800",
  };

  const isFull = event.quota && event._count?.registrations >= event.quota;
  const canRegister = event.registrationOpen && event.status !== "SELESAI" && !isFull && session?.user;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={session?.user ? "/discovery" : "/landing"} className="text-[#7960D7] hover:underline flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </Link>

          <nav className="flex items-center gap-6">
            <Link href={session?.user ? "/discovery" : "/landing"} className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/komunitas" className="text-gray-600 hover:text-gray-900">
              Community
            </Link>
            <Link href="/event" className="text-gray-600 hover:text-gray-900">
              Event
            </Link>
          </nav>

          {session?.user ? (
            <Link href="/profile" className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
              <span className="text-white font-semibold">
                {session.user.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </Link>
          ) : (
            <Link href="/login" className="px-4 py-2 text-[#7960D7] hover:bg-[#7960D7] hover:bg-opacity-10 rounded-full font-medium transition-colors">
              Log in
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-8 mb-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusBadge}`}>
              {event.status}
            </span>
          </div>

          <p className="text-gray-600 mb-6">{event.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-500 mb-1">📅 Tanggal</p>
              <p className="text-gray-900 font-medium">
                {new Date(event.startDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">⏰ Waktu</p>
              <p className="text-gray-900 font-medium">{event.startTime || "Waktu belum diumumkan"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">📍 Lokasi</p>
              <p className="text-gray-900 font-medium">{event.venue || event.area || "Lokasi TBA"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">👥 Kuota</p>
              <p className="text-gray-900 font-medium">
                {event.quota ? `${event._count?.registrations || 0} / ${event.quota}` : "Tidak terbatas"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">💰 Biaya</p>
              <p className="text-gray-900 font-medium">{event.fee || "Gratis"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">📞 Kontak</p>
              <p className="text-gray-900 font-medium">{event.contactInfo || event.organizer}</p>
            </div>
          </div>

          {event.isRegistered ? (
            <button className="w-full px-6 py-3 rounded-lg bg-gray-300 text-gray-900 font-medium cursor-not-allowed">
              Sudah Terdaftar
            </button>
          ) : canRegister ? (
            <button
              onClick={() => alert("Fitur registrasi memerlukan login. Implementasi lengkap di route handler dengan auth.")}
              className="w-full px-6 py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Daftar Event
            </button>
          ) : isFull ? (
            <button className="w-full px-6 py-3 rounded-lg bg-gray-300 text-gray-900 font-medium cursor-not-allowed">
              Kuota Penuh
            </button>
          ) : !event.registrationOpen ? (
            <button className="w-full px-6 py-3 rounded-lg bg-gray-300 text-gray-900 font-medium cursor-not-allowed">
              Pendaftaran Ditutup
            </button>
          ) : !session?.user ? (
            <Link
              href="/login"
              className="block w-full px-6 py-3 rounded-lg bg-gray-900 text-white font-medium text-center hover:bg-gray-800 transition-colors"
            >
              Log in untuk Daftar
            </Link>
          ) : (
            <button className="w-full px-6 py-3 rounded-lg bg-gray-300 text-gray-900 font-medium cursor-not-allowed">
              Event Selesai
            </button>
          )}

          {event.dataSource === "REFERENCE_UNVERIFIED" && (
            <p className="mt-4 text-xs text-gray-500 text-center">
              📌 Data referensi — belum diverifikasi
            </p>
          )}

          {event.externalLink && (
            <p className="mt-4 text-sm text-center">
              <a href={event.externalLink} target="_blank" rel="noopener noreferrer" className="text-[#7960D7] hover:underline">
                Tautan sumber eksternal
              </a>
            </p>
          )}
        </div>

        {event.relatedCommunities?.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-3">Komunitas Terkait</h2>
            {event.relatedCommunities.map((rc: any) => (
              <Link
                key={rc.community.id}
                href={`/komunitas/${rc.community.id}`}
                className="block text-[#7960D7] hover:underline mb-2"
              >
                {rc.community.name}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
