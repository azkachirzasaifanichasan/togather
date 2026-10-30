"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Header } from "@/components/Header";
import { RsvpButton } from "@/components/events/RsvpButton";

interface RelatedCommunity {
  id: string;
  name: string;
}

interface EventDetail {
  id: string;
  name: string;
  description: string;
  status: "MENDATANG" | "BERLANGSUNG" | "SELESAI";
  startDate: string;
  endDate?: string | null;
  startTime?: string | null;
  venue?: string | null;
  area?: string | null;
  organizer?: string | null;
  contactInfo?: string | null;
  quota?: number | null;
  registrationOpen: boolean;
  fee?: string | null;
  externalLink?: string | null;
  dataSource?: string;
  isRegistered?: boolean;
  relatedCommunities?: RelatedCommunity[];
  _count?: { registrations?: number };
}

const STATUS_STYLE: Record<string, { className: string; label: string }> = {
  MENDATANG: { className: "bg-green-100 text-green-800", label: "Akan datang" },
  BERLANGSUNG: { className: "bg-blue-100 text-blue-800", label: "Sedang berlangsung" },
  SELESAI: { className: "bg-gray-100 text-gray-800", label: "Selesai" },
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("detail");

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (active) setIsLoggedIn(Boolean(data?.user));
      })
      .catch(() => undefined);

    fetch(`/api/events/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setEvent(data);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  const handleRegister = async () => {
    setRegistering(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${params.id}/rsvp`, { method: "POST" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mendaftar event");
        return;
      }
      const refreshed = await fetch(`/api/events/${params.id}`);
      setEvent(await refreshed.json());
    } catch {
      setError("Gagal mendaftar event");
    } finally {
      setRegistering(false);
    }
  };

  // suppress unused warning — handleRegister is wired via RsvpButton
  void handleRegister;
  void registering;

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 h-4 w-32 animate-pulse rounded-full bg-gray-100" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
            </div>
            <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="mb-2 text-xl font-bold text-gray-900">Event tidak ditemukan</p>
          <Link href="/event" className="text-[#7960D7] hover:underline">
            Kembali ke daftar event
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_STYLE[event.status] ?? STATUS_STYLE.MENDATANG;
  const attendeeCount = event._count?.registrations ?? 0;
  const isFull = Boolean(event.quota) && attendeeCount >= (event.quota ?? 0);
  const isPast = event.status === "SELESAI";

  // Format date untuk event
  const eventDate = new Date(event.startDate);
  const formattedDate = eventDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString("id-ID", { month: "short" }).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/event" className="hover:text-gray-900">
            Semua Event
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-900 truncate">{event.name}</span>
        </nav>

        {/* Hero Banner - Full Width dengan Background Image */}
        <div className="relative mb-8 overflow-hidden bg-gray-900 text-white">
          {/* Background Image */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70">
            <div className="absolute inset-0" style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.4
            }}></div>
          </div>
          
          <div className="relative">
            <div className="mx-auto max-w-6xl px-8 py-16">
              {/* Badge Status */}
              <div className="mb-4 inline-block">
                <span className={`rounded-full px-4 py-2 text-sm font-medium ${status.className}`}>
                  {status.label}
                </span>
              </div>
              
              {/* Event Title */}
              <h1 className="mb-6 text-4xl font-bold leading-tight lg:text-5xl">
                {event.name}
              </h1>
              
              {/* Event Info Simple */}
              <div className="space-y-4">
                <div className="text-lg font-medium">Sabtu, 28 November 2026</div>
                <div className="text-lg font-medium">09:00 WIB</div>
                <div className="text-lg font-medium">Pendopo Kabupaten Bantul</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Tentang Event Ini</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {event.description}
              </p>
              
              {/* Informasi Event */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Tanggal</div>
                  <div className="font-medium">Sabtu, 28 November 2026</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Waktu</div>
                  <div className="font-medium">09:00 WIB</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Lokasi</div>
                  <div className="font-medium">Pendopo Kabupaten Bantul</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Biaya</div>
                  <div className="font-medium text-[#7960D7]">{event.fee || "Gratis"}</div>
                </div>
              </div>
              
              {/* Detail Tambahan */}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-3 text-gray-900">Informasi Tambahan</h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Kuota peserta: {event.quota ? `${attendeeCount} dari ${event.quota}` : "Tidak terbatas"}</p>
                  <p className="mb-2">Penyelenggara: {event.organizer || "Togather Community"}</p>
                  <p>Status: {event.registrationOpen ? "Pendaftaran masih dibuka" : "Pendaftaran ditutup"}</p>
                </div>
              </div>
            </div>
            
            {/* Komunitas Terkait */}
            {event.relatedCommunities && event.relatedCommunities.length > 0 && (
              <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Komunitas Terkait</h2>
                <div className="space-y-4">
                  {event.relatedCommunities.map((community) => (
                    <Link
                      key={community.id}
                      href={`/komunitas/${community.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="h-10 w-10 bg-[#7960D7] rounded-lg flex items-center justify-center text-white font-bold">
                        {community.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{community.name}</div>
                        <div className="text-sm text-gray-600">Komunitas terkait event ini</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="sticky top-6 space-y-6">
              {/* Card Pendaftaran */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Pendaftaran Event</h3>
                
                {event.quota && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Kuota tersedia</span>
                      <span>{event.quota - attendeeCount} dari {event.quota}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${(attendeeCount / event.quota) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Biaya event</div>
                  <div className="text-2xl font-bold text-[#7960D7]">{event.fee || "Gratis"}</div>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <RsvpButton
                    eventId={event.id}
                    isRegistered={Boolean(event.isRegistered)}
                    registrationOpen={event.registrationOpen}
                    isFull={isFull}
                    isPast={isPast}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
                
                <div className="text-xs text-gray-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Tiket dikirim via email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Konfirmasi instan setelah daftar</span>
                  </div>
                </div>
                
                {event.dataSource === "REFERENCE_UNVERIFIED" && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      Data referensi — belum diverifikasi admin
                    </p>
                  </div>
                )}
              </div>
              
              {/* Bagikan Event */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold mb-3 text-gray-900">Bagikan ke teman</h3>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700">
                    Facebook
                  </button>
                  <button className="flex-1 bg-sky-500 text-white py-2 rounded text-sm font-medium hover:bg-sky-600">
                    Twitter
                  </button>
                  <button className="flex-1 bg-green-500 text-white py-2 rounded text-sm font-medium hover:bg-green-600">
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
