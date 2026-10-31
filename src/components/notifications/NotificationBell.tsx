"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type NotificationItem = {
  id: string;
  type: string;
  personal: boolean;
  message: string;
  createdAt: string;
  readAt: string | null;
  postId: string | null;
  commentId: string | null;
  actorName: string;
  actorAvatarUrl: string | null;
  communityId: string;
  communityName: string;
  postPreview: string | null;
};

function relativeTime(iso: string, now: number) {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.round(hours / 24)} hari lalu`;
}

/**
 * The bell in the header: unread badge plus the notification dropdown.
 *
 * One list, no tabs. Every notification links to the post it is about, and
 * opening the panel marks everything as read.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  // The clock is read outside of render (on fetch and on every poll) so the
  // component stays pure.
  const [now, setNow] = useState(() => Date.now());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !payload) return;
        setItems(payload.notifications ?? []);
        setUnread(payload.unreadCounts?.all ?? 0);
        setNow(Date.now());
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Refresh the badge periodically so new activity shows up.
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((payload) => {
          if (payload) setUnread(payload.unreadCounts?.all ?? 0);
        })
        .catch(() => {});
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);

    if (next && unread > 0) {
      // Opening the panel is the "I have seen them" signal.
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).catch(() => {});
      setUnread(0);
      setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    }
  };

  const relativeLabel = (iso: string) => relativeTime(iso, now);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
        aria-expanded={open}
        className={`relative rounded-full p-2 transition-colors hover:bg-gray-100 ${open ? "bg-gray-100" : ""}`}
      >
        <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.03 2.03 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[1200] mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Notifikasi</p>
            {unread > 0 && (
              <span className="text-xs font-medium text-[#7960D7]">{unread} belum dibaca</span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-500">Memuat notifikasi…</p>
            )}

            {!loading && items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                Belum ada notifikasi.
              </p>
            )}

            {items.map((item) => (
              <Link
                key={item.id}
                href={
                  item.postId
                    ? `/komunitas/${item.communityId}?post=${item.postId}${
                        item.commentId ? `&comment=${item.commentId}` : ""
                      }`
                    : `/komunitas/${item.communityId}`
                }
                onClick={() => setOpen(false)}
                className={`flex gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-gray-50 ${
                  item.readAt ? "bg-white" : "bg-[#7960D7]/5"
                }`}
              >
                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                  {item.actorAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.actorAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white bg-[#7960D7]">
                      {item.actorName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800">{item.message}</p>
                  {item.postPreview && (
                    <p className="mt-0.5 truncate text-xs text-gray-500">{item.postPreview}</p>
                  )}
                  <p className="mt-0.5 text-xs text-gray-400">
                    {item.communityName} · {relativeLabel(item.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
