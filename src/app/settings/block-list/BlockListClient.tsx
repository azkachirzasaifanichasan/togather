"use client";

import { useState } from "react";
import type { BlockedUserItem } from "@/server/moderation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-600">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function BlockListClient({
  initialBlockedUsers,
}: {
  initialBlockedUsers: BlockedUserItem[];
}) {
  const [users, setUsers] = useState<BlockedUserItem[]>(initialBlockedUsers);
  const [unblockTarget, setUnblockTarget] = useState<BlockedUserItem | null>(
    null
  );
  const [busy, setBusy] = useState(false);

  const handleConfirmUnblock = async () => {
    if (!unblockTarget) return;
    const target = unblockTarget;
    setBusy(true);

    try {
      const response = await fetch(`/api/users/${target.id}/block`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to unblock user");
      }

      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      setUnblockTarget(null);
    } catch {
      // Leave in list if request failed
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1F2937]">Block List</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Pengguna yang kamu blokir tidak akan bisa melihat postingan atau
              komentar kamu, dan kamu tidak akan melihat aktivitas mereka.
            </p>
          </div>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7960D7]">
            {users.length} akun
          </span>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-400">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-bold text-gray-900">
            Tidak ada akun yang diblokir
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            Kamu belum memblokir siapa pun. Jika ada pengguna yang kamu blokir,
            mereka akan tercantum di sini dan kamu bisa membatalkannya kapan saja.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <ul className="divide-y divide-gray-100">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                    <Avatar name={user.name} url={user.avatarUrl} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-gray-900">
                      {user.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Diblokir sejak {relativeTime(user.blockedAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUnblockTarget(user)}
                  className="flex-shrink-0 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                >
                  Buka blokir
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={unblockTarget !== null}
        title={`Buka blokir ${unblockTarget?.name ?? ""}?`}
        description={`Kamu dan ${
          unblockTarget?.name ?? "pengguna ini"
        } akan dapat melihat kembali postingan serta komentar satu sama lain di komunitas bersama.`}
        confirmLabel="Buka blokir"
        confirmVariant="primary"
        busy={busy}
        onCancel={() => setUnblockTarget(null)}
        onConfirm={handleConfirmUnblock}
      />
    </div>
  );
}

