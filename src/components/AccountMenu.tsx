"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";

type AccountUser = {
  name: string;
  email?: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
};

function Avatar({ user, className }: { user: AccountUser; className: string }) {
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={user.name}
        draggable={false}
        className={`${className} rounded-full object-cover select-none`}
      />
    );
  }
  return (
    <div
      className={`${className} rounded-full bg-[#7960D7] flex items-center justify-center text-white font-bold`}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

const MENU = [
  {
    href: "/event-saya",
    label: "Your events",
    path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    href: "/komunitas-saya",
    label: "Your groups",
    path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    href: "/profile",
    label: "View profile",
    path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    href: "/settings/edit-profile",
    label: "Settings",
    path: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

// Shared top-right account button. `initialUser` comes from the server so the
// avatar paints immediately; when omitted (client pages) it is fetched.
export function AccountMenu({
  initialUser,
  size = "md",
}: {
  initialUser?: AccountUser | null;
  size?: "md" | "sm";
}) {
  const [user, setUser] = useState<AccountUser | null | undefined>(initialUser);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Always refresh: the server-provided snapshot may predate an avatar change.
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else if (initialUser === undefined) setUser(null);
      })
      .catch(() => {
        if (initialUser === undefined) setUser(null);
      });
  }, [initialUser]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm font-semibold text-[#7960D7] hover:underline"
      >
        Masuk
      </Link>
    );
  }

  const box = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        // A press that drifts a few px becomes a native drag/text-selection and
        // swallows the click entirely, so the avatar must not drag or select.
        // A fast double tap fires click twice -> open then instantly closed;
        // only the first click of a burst counts.
        onClick={(e) => {
          if (e.detail > 1) return;
          setOpen((v) => !v);
        }}
        onDragStart={(e) => e.preventDefault()}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu akun"
        className="block rounded-full select-none focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:ring-offset-2"
      >
        <Avatar user={user} className={box} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-[#1F2937] truncate">
              {user.name}
            </p>
            <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
          </div>

          {MENU.map((item, i) => (
            <div key={item.href}>
              {i === MENU.length - 1 && (
                <div className="my-2 border-t border-gray-100" />
              )}
              <Link
                role="menuitem"
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-gray-50"
              >
                <svg
                  className="w-5 h-5 text-[#6B7280]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.path}
                  />
                </svg>
                {item.label}
              </Link>
            </div>
          ))}

          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
