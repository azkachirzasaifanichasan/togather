"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RsvpButtonProps {
  eventId: string;
  isRegistered: boolean;
  registrationOpen: boolean;
  isFull: boolean;
  isPast: boolean;
  isLoggedIn: boolean;
}

function readErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const error = (payload as { error?: unknown }).error;
  if (!error) return null;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : null;
  }
  return null;
}

export function RsvpButton({
  eventId,
  isRegistered: initialIsRegistered,
  registrationOpen,
  isFull,
  isPast,
  isLoggedIn,
}: RsvpButtonProps) {
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const callApi = async (method: "POST" | "DELETE") => {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, { method });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(readErrorMessage(payload) ?? "Gagal memproses pendaftaran.");
        return;
      }

      const status = (payload as { status?: string } | null)?.status;

      if (method === "DELETE" || status === "cancelled") {
        setIsRegistered(false);
        setMessage("Pendaftaran dibatalkan.");
      } else if (status === "registered" || status === "re-registered" || status === "already_registered") {
        setIsRegistered(true);
        setMessage(
          status === "already_registered"
            ? "Kamu sudah terdaftar di event ini."
            : "Berhasil mendaftar. Sampai jumpa di acara!"
        );
      }

      router.refresh();
    } catch {
      setMessage("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  };

  const baseClass = "w-full rounded-lg px-6 py-3 font-medium transition-colors";

  if (!isLoggedIn) {
    return (
      <div className="space-y-2">
        <Link
          href="/login"
          className={`${baseClass} block bg-gray-900 text-center text-white hover:bg-gray-800`}
        >
          Masuk untuk mendaftar
        </Link>
        <p className="text-center text-xs text-gray-500">
          Kamu perlu akun Togather untuk mendaftar event.
        </p>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => callApi("DELETE")}
          disabled={pending}
          className={`${baseClass} border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {pending ? "Memproses..." : "Batalkan pendaftaran"}
        </button>
        <p className="text-center text-xs text-green-700">Kamu terdaftar di event ini.</p>
        {message && (
          <p className="text-center text-xs text-gray-600" role="status">
            {message}
          </p>
        )}
      </div>
    );
  }

  if (isPast) {
    return (
      <button type="button" disabled className={`${baseClass} cursor-not-allowed bg-gray-200 text-gray-700`}>
        Event sudah selesai
      </button>
    );
  }

  if (isFull) {
    return (
      <button type="button" disabled className={`${baseClass} cursor-not-allowed bg-gray-200 text-gray-700`}>
        Kuota penuh
      </button>
    );
  }

  if (!registrationOpen) {
    return (
      <button type="button" disabled className={`${baseClass} cursor-not-allowed bg-gray-200 text-gray-700`}>
        Pendaftaran ditutup
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => callApi("POST")}
        disabled={pending}
        className={`${baseClass} bg-gray-900 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {pending ? "Memproses..." : "Daftar Event"}
      </button>
      {message && (
        <p className="text-center text-xs text-gray-600" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
