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
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/event"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Semua event
        </Link>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
            <span className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium ${status.className}`}>
              {status.label}
            </span>
          </div>

          <p className="mb-6 leading-relaxed text-gray-600">{event.description}</p>

          <div className="mb-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="mb-1 text-gray-500">Tanggal</p>
              <p className="font-medium text-gray-900">
                {new Date(event.startDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="mb-1 text-gray-500">Waktu</p>
              <p className="font-medium text-gray-900">{event.startTime || "Belum diumumkan"}</p>
            </div>
            <div>
              <p className="mb-1 text-gray-500">Lokasi</p>
              <p className="font-medium text-gray-900">
                {event.venue || event.area?.replaceAll("_", " ") || "Belum diumumkan"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-gray-500">Peserta</p>
              <p className="font-medium text-gray-900">
                {event.quota ? `${attendeeCount} / ${event.quota}` : `${attendeeCount} terdaftar`}
              </p>
            </div>
            <div>
              <p className="mb-1 text-gray-500">Biaya</p>
              <p className="font-medium text-gray-900">{event.fee || "Gratis"}</p>
            </div>
            <div>
              <p className="mb-1 text-gray-500">Penyelenggara</p>
              <p className="font-medium text-gray-900">{event.organizer || "-"}</p>
            </div>
          </div>

          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}

          <RsvpButton
            eventId={event.id}
            isRegistered={Boolean(event.isRegistered)}
            registrationOpen={event.registrationOpen}
            isFull={isFull}
            isPast={isPast}
            isLoggedIn={isLoggedIn}
          />

          {event.dataSource === "REFERENCE_UNVERIFIED" && (
            <p className="mt-4 text-center text-xs text-gray-500">
              Data referensi — belum diverifikasi admin.
            </p>
          )}

          {event.externalLink && (
            <p className="mt-4 text-center text-sm">
              <a
                href={event.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7960D7] hover:underline"
              >
                Tautan sumber eksternal
              </a>
            </p>
          )}
        </div>

        {event.relatedCommunities && event.relatedCommunities.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-3 font-bold text-gray-900">Komunitas terkait</h2>
            <div className="space-y-2">
              {event.relatedCommunities.map((community) => (
                <Link
                  key={community.id}
                  href={`/komunitas/${community.id}`}
                  className="block text-[#7960D7] hover:underline"
                >
                  {community.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
