"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Row actions for the admin community list: edit, or hard-delete.
 *
 * Approval is deliberately not here — it lives in the Approval view, reachable
 * from the badge in the community menu.
 */
export function AdminCommunityActions({
  communityId,
  name,
}: {
  communityId: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (request: () => Promise<Response>) => {
    setPending(true);
    setError(null);
    try {
      const response = await request();
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(
          (payload as { error?: { message?: string } } | null)?.error?.message ??
            "Aksi gagal. Coba lagi."
        );
        return;
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setPending(false);
    }
  };

  const remove = () => {
    if (
      !window.confirm(
        `Hapus komunitas "${name}"? Anggota, pengurus, pengajuan, dan tautan event ikut terhapus. Event-nya sendiri tetap ada.`
      )
    ) {
      return;
    }
    void run(() =>
      fetch(`/api/admin/communities/${communityId}`, { method: "DELETE" })
    );
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href={`/admin/komunitas/${communityId}/edit`}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-[#1F2937] hover:bg-gray-50"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          Hapus
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
