"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface JoinButtonProps {
  communityId: string;
  isMember: boolean;
  accessType: "PUBLIC" | "PRIVATE";
  isLoggedIn: boolean;
  initialRequestStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
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

export function JoinButton({
  communityId,
  isMember: initialIsMember,
  accessType,
  isLoggedIn,
  initialRequestStatus = null,
}: JoinButtonProps) {
  const router = useRouter();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [requestStatus, setRequestStatus] = useState(initialRequestStatus);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const callApi = async (method: "POST" | "DELETE") => {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/communities/${communityId}/join`, { method });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(readErrorMessage(payload) ?? "Gagal memproses permintaan.");
        return;
      }

      const status = (payload as { status?: string } | null)?.status;

      if (method === "DELETE") {
        setIsMember(false);
        setMessage("Kamu keluar dari komunitas ini.");
      } else if (status === "joined" || status === "already_member") {
        setIsMember(true);
        setRequestStatus(null);
        setMessage("Berhasil bergabung.");
      } else if (status === "request_created") {
        setRequestStatus("PENDING");
        setMessage("Permintaan bergabung dikirim. Menunggu persetujuan pengurus.");
      } else if (status === "request_exists") {
        setRequestStatus("PENDING");
        setMessage("Permintaanmu masih menunggu persetujuan pengurus.");
      }

      router.refresh();
    } catch {
      setMessage("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Link
          href="/login"
          className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Masuk untuk bergabung
        </Link>
        <p className="text-xs text-gray-500">
          {accessType === "PRIVATE"
            ? "Komunitas privat memerlukan persetujuan pengurus."
            : "Gratis, cukup punya akun Togather."}
        </p>
      </div>
    );
  }

  if (!isMember && requestStatus === "PENDING") {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg bg-amber-100 px-6 py-3 font-semibold text-amber-800"
        >
          Menunggu persetujuan
        </button>
        <p className="text-xs text-gray-500">Pengurus belum meninjau permintaanmu.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => callApi(isMember ? "DELETE" : "POST")}
        disabled={pending}
        className={`rounded-lg px-6 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isMember
            ? "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
            : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        {pending
          ? "Memproses..."
          : isMember
            ? "Keluar dari komunitas"
            : accessType === "PRIVATE"
              ? "Minta bergabung"
              : "Gabung komunitas"}
      </button>

      {message && (
        <p className="max-w-xs text-right text-xs text-gray-600" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
