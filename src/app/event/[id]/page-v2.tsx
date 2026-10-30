"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Header } from "@/components/Header";

interface Speaker {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
}

interface Ticket {
  id: string;
  name: string;
  price: number;
  currency: string;
  available: number;
  description: string;
}

interface AgendaItem {
  id: string;
  time: string;
  title: string;
  description: string;
  speakerId?: string;
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
  relatedCommunities?: Array<{ id: string; name: string }>;
  _count?: { registrations?: number };
  
  // Fitur tambahan untuk tipe interaktif
  eventType?: "INFORMATIONAL" | "INTERACTIVE";
  speakers?: Speaker[];
  tickets?: Ticket[];
  agenda?: AgendaItem[];
  venueDetails?: string;
  socialLinks?: { platform: string; url: string }[];
}

const STATUS_STYLE: Record<string, { className: string; label: string }> = {
  MENDATANG: { className: "bg-green-100 text-green-800", label: "Akan datang" },
  BERLANGSUNG: { className: "bg-blue-100 text-blue-800", label: "Sedang berlangsung" },
  SELESAI: { className: "bg-gray-100 text-gray-800", label: "Selesai" },
};

export default function EventDetailInteractivePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    phone: "",
    note: "",
  });

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (active) setIsLoggedIn(Boolean(data?.user));
      })
      .catch(() => undefined);

    // Untuk demo, kita akan generate data dummy untuk fitur interaktif
    fetch(`/api/events/${params.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        
        // Tambahkan data dummy untuk fitur interaktif
        const interactiveEvent = {
          ...data,
          eventType: "INTERACTIVE",
          speakers: [
            { id: "1", name: "Budi Santoso", title: "CEO Startup Jogja", bio: "Founder of multiple tech startups", avatarUrl: null },
            { id: "2", name: "Sari Dewi", title: "Product Manager", bio: "Expert in product development and UX", avatarUrl: null },
          ],
          tickets: [
            { id: "t1", name: "Early Bird", price: 50000, currency: "IDR", available: 20, description: "Tiket early bird dengan harga spesial" },
            { id: "t2", name: "Regular", price: 75000, currency: "IDR", available: 50, description: "Tiket regular" },
            { id: "t3", name: "VIP", price: 150000, currency: "IDR", available: 10, description: "Akses VIP dengan fasilitas eksklusif" },
          ],
          agenda: [
            { id: "a1", time: "08:00 - 09:00", title: "Registrasi & Networking", description: "Registrasi peserta dan networking session" },
            { id: "a2", time: "09:00 - 10:00", title: "Opening Keynote", description: "Pembukaan dan keynote speech", speakerId: "1" },
            { id: "a3", time: "10:00 - 11:30", title: "Workshop Product Development", description: "Workshop pengembangan produk", speakerId: "2" },
            { id: "a4", time: "11:30 - 12:30", title: "Panel Discussion", description: "Diskusi panel dengan para expert" },
          ],
          venueDetails: "Co-working space dengan fasilitas lengkap: WiFi cepat, ruang meeting, coffee break, dan parking area.",
          socialLinks: [
            { platform: "Instagram", url: "https://instagram.com/event" },
            { platform: "Twitter", url: "https://twitter.com/event" },
          ],
        };
        
        setEvent(interactiveEvent);
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
    if (!selectedTicket) {
      alert("Pilih tiket terlebih dahulu");
      return;
    }

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/events/${params.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket,
          ...registrationData,
        }),
      });

      if (res.ok) {
        alert("Pendaftaran berhasil!");
        router.push("/event");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mendaftar");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
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
  const isInteractive = event.eventType === "INTERACTIVE";

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-gray-900">Home</Link></li>
            <li>/</li>
            <li><Link href="/event" className="hover:text-gray-900">Events</Link></li>
            <li>/</li>
            <li className="text-gray-900">{event.name}</li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="mb-3 text-4xl font-bold text-gray-900">{event.name}</h1>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-4 py-2 text-sm font-medium ${status.className}`}>
                  {status.label}
                </span>
                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                  {attendeeCount} Peserta Terdaftar
                </span>
                {isInteractive && (
                  <span className="rounded-full bg-[#7960D7]/10 px-4 py-2 text-sm font-medium text-[#7960D7]">
                    Event Interaktif
                  </span>
                )}
              </div>
              <p className="text-lg text-gray-600">{event.description}</p>
            </div>
            <div className="lg:w-96">
              {/* Action Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <p className="mb-1 text-sm text-gray-500">Tanggal & Waktu</p>
                  <p className="font-medium text-gray-900">
                    {new Date(event.startDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-gray-600">{event.startTime || "Waktu TBA"}</p>
                </div>
                
                <div className="mb-4">
                  <p className="mb-1 text-sm text-gray-500">Lokasi</p>
                  <p className="font-medium text-gray-900">
                    {event.venue || event.area?.replaceAll("_", " ") || "Online"}
                  </p>
                </div>

                {!isPast && isInteractive && event.tickets && event.tickets.length > 0 && (
                  <div className="mb-6">
                    <p className="mb-3 text-sm font-medium text-gray-900">Pilih Tiket</p>
                    <div className="space-y-3">
                      {event.tickets.map((ticket) => (
                        <label
                          key={ticket.id}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                            selectedTicket === ticket.id
                              ? "border-[#7960D7] bg-[#7960D7]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="ticket"
                              value={ticket.id}
                              checked={selectedTicket === ticket.id}
                              onChange={(e) => setSelectedTicket(e.target.value)}
                              className="h-4 w-4 text-[#7960D7]"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{ticket.name}</p>
                              <p className="text-sm text-gray-600">{ticket.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {ticket.price === 0 ? "Gratis" : `Rp ${ticket.price.toLocaleString()}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {ticket.available} tersedia
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {!isPast ? (
                  <button
                    onClick={handleRegister}
                    disabled={isFull || !event.registrationOpen || (!isLoggedIn && !isInteractive)}
                    className={`w-full rounded-lg px-6 py-3 font-semibold transition-colors ${
                      isFull || !event.registrationOpen
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "bg-[#7960D7] text-white hover:bg-[#6950c7]"
                    }`}
                  >
                    {isFull ? "Event Penuh" : 
                     !event.registrationOpen ? "Pendaftaran Ditutup" :
                     isLoggedIn ? "Daftar Sekarang" : "Login untuk Mendaftar"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-400"
                  >
                    Event Telah Selesai
                  </button>
                )}

                {event.fee && event.fee !== "Gratis" && (
                  <p className="mt-3 text-center text-xs text-gray-500">
                    *Pembayaran melalui transfer bank atau e-wallet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2">
            {/* Agenda Section */}
            {isInteractive && event.agenda && event.agenda.length > 0 && (
              <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Agenda Event</h2>
                <div className="space-y-4">
                  {event.agenda.map((item) => {
                    const speaker = event.speakers?.find(s => s.id === item.speakerId);
                    return (
                      <div key={item.id} className="flex gap-4 border-l-4 border-[#7960D7] pl-4 py-2">
                        <div className="w-32 flex-shrink-0">
                          <p className="font-medium text-gray-900">{item.time}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-gray-600">{item.description}</p>
                          {speaker && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{speaker.name}</p>
                                <p className="text-xs text-gray-600">{speaker.title}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Speakers Section */}
            {isInteractive && event.speakers && event.speakers.length > 0 && (
              <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Pembicara</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {event.speakers.map((speaker) => (
                    <div key={speaker.id} className="flex items-start gap-4">
                      <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gray-200"></div>
                      <div>
                        <p className="font-bold text-gray-900">{speaker.name}</p>
                        <p className="text-sm text-[#7960D7]">{speaker.title}</p>
                        <p className="mt-2 text-sm text-gray-600">{speaker.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue Details */}
            {event.venueDetails && (
              <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">Lokasi & Fasilitas</h2>
                <p className="text-gray-600">{event.venueDetails}</p>
                <div className="mt-4 h-64 rounded-lg bg-gray-100"></div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Organizer Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-bold text-gray-900">Penyelenggara</h3>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#7960D7]"></div>
                <div>
                  <p className="font-medium text-gray-900">{event.organizer || "Togather"}</p>
                  <p className="text-sm text-gray-600">Organizer Event</p>
                </div>
              </div>
              {event.contactInfo && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-gray-500">Kontak</p>
                  <p className="text-gray-900">{event.contactInfo}</p>
                </div>
              )}
            </div>

            {/* Community Info */}
            {event.relatedCommunities && event.relatedCommunities.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-bold text-gray-900">Komunitas Terkait</h3>
                <div className="space-y-3">
                  {event.relatedCommunities.map((community) => (
                    <Link
                      key={community.id}
                      href={`/komunitas/${community.id}`}
                      className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50"
                    >
                      <div className="h-10 w-10 rounded-lg bg-[#7960D7]"></div>
                      <p className="font-medium text-gray-900">{community.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Social Sharing */}
            {event.socialLinks && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-bold text-gray-900">Bagikan Event</h3>
                <div className="flex gap-3">
                  {event.socialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {link.platform}
                    </a>
                  ))}
                  <button className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Salin Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
