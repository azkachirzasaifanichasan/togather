"use client";

import { useEffect, useRef, useState } from "react";

type Level = "ALL" | "PERSONAL" | "OFF";

const OPTIONS: Array<{ value: Level; label: string; description: string }> = [
  {
    value: "ALL",
    label: "Semua notifikasi",
    description: "Semua aktivitas di komunitas ini",
  },
  {
    value: "PERSONAL",
    label: "Personal saja",
    description: "Hanya suka, komentar, dan share di postingmu",
  },
  {
    value: "OFF",
    label: "Nonaktifkan",
    description: "Tidak menerima notifikasi apa pun",
  },
];

/**
 * Notification level for one community.
 *
 * The level is scoped to this community only: it decides which
 * notifications are delivered, so OFF really stops the noise instead of
 * just hiding it.
 */
export function NotificationLevelMenu({
  communityId,
  initialLevel = "ALL",
}: {
  communityId: string;
  initialLevel?: Level;
}) {
  const [level, setLevel] = useState<Level>(initialLevel);
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const current = OPTIONS.find((o) => o.value === level) ?? OPTIONS[0];

  const toggle = () => {
    // Open upwards when there is not enough room below.
    const box = ref.current?.getBoundingClientRect();
    if (box) setDropUp(window.innerHeight - box.bottom < 200);
    setOpen((prev) => !prev);
  };

  const choose = async (next: Level) => {
    setOpen(false);
    if (next === level) return;

    setLevel(next);
    setSaving(true);

    try {
      await fetch(`/api/communities/${communityId}/notification-level`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: next }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Notifikasi komunitas: ${current.label}`}
        title={current.label}
        className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
          level === "OFF"
            ? "border-gray-300 bg-white text-gray-500"
            : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
        }`}
      >
        {level === "OFF" ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.03 2.03 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3l18 18" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.03 2.03 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )}
        <span className="hidden sm:inline">{current.label}</span>
        {saving && <span className="text-xs text-gray-400">…</span>}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 z-[1200] w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg ${
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === level}
              onClick={() => choose(option.value)}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
            >
              <span
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                  option.value === level
                    ? "border-[#7960D7] bg-[#7960D7]"
                    : "border-gray-300"
                }`}
              >
                {option.value === level && (
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  {option.label}
                </span>
                <span className="block text-xs text-gray-500">{option.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
