"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";
import { LocationInput } from "@/components/LocationInput";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

interface HeaderProps {
  showSearch?: boolean;
  locationLabel?: string;
  onLocationChange?: (label: string, lat: number, lon: number) => void;
}

type Panel = "chat" | "notifications" | "help" | "account" | null;

const ACCOUNT_MENU = [
  {
    href: "/komunitas",
    label: "Your community",
    icon: (
      <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/event",
    label: "Your events",
    icon: (
      <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "View profile",
    icon: (
      <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function Header({ showSearch = true, locationLabel, onLocationChange }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setUser(data?.user ?? null);
        setReady(true);
      })
      .catch(() => {
        if (active) {
          // fallback to session endpoint
          fetch("/api/auth/session")
            .then((res) => res.json())
            .then((data) => {
              if (active) {
                setUser(data?.user ?? null);
                setReady(true);
              }
            })
            .catch(() => {
              if (active) setReady(true);
            });
        }
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!panel) return;

    const onClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanel(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  const homeHref = user ? "/discovery" : "/landing";

  const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/discovery?search=${encodeURIComponent(trimmed)}` : "/discovery");
  };

  const navLink = (href: string, label: string, isActive: boolean) => (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        isActive ? "bg-[#7960D7] text-white" : "text-[#1F2937] hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  const initial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";

  const togglePanel = (target: Panel) =>
    setPanel((prev) => (prev === target ? null : target));

  return (
    <header className="sticky top-0 z-[1100] border-b border-gray-200 bg-white">
      <div className="flex w-full items-center gap-4 px-5 py-3 lg:px-8">
        {/* Logo */}
        <Link href={homeHref} className="flex flex-shrink-0 items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7960D7]">
            <Image
              src="/logo-togather.png"
              alt="Togather"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="hidden text-lg font-bold text-[#1F2937] sm:inline">Togather</span>
        </Link>

        {/* Search bar */}
        {showSearch && (
          <div className="hidden flex-1 items-center md:flex md:max-w-lg">
            <div className="flex w-full rounded-full border border-gray-300 bg-white shadow-sm focus-within:border-[#7960D7] focus-within:ring-1 focus-within:ring-[#7960D7] transition-all">
              {/* Search input — dalam form sendiri untuk Enter */}
              <form onSubmit={handleSearch} className="flex min-w-0 flex-1">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search for anything"
                  aria-label="Cari komunitas atau event"
                  className="min-w-0 flex-1 rounded-l-full bg-transparent py-2 pl-5 pr-2 text-sm text-[#1F2937] placeholder-gray-400 focus:outline-none"
                />
              </form>
              {/* Divider */}
              <div className="my-2 w-px flex-shrink-0 bg-gray-300" />
              {/* Location — sengaja di luar form & div overflow agar dropdown tidak terpotong */}
              <LocationInput
                value={locationLabel ?? "Yogyakarta, ID"}
                onChange={onLocationChange ?? (() => {})}
              />
              {/* Search button */}
              <button
                type="button"
                onClick={() => handleSearch()}
                aria-label="Cari"
                className="m-1 flex-shrink-0 rounded-full bg-[#1F2937] px-3 py-1.5 text-white transition-colors hover:bg-gray-800"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}



        {/* Nav links */}
        <nav className="ml-auto flex items-center gap-1">
          {navLink(homeHref, "Home", pathname === "/" || pathname === "/landing" || pathname === "/discovery")}
          {navLink("/komunitas", "Community", pathname.startsWith("/komunitas"))}
          {navLink("/event", "Event", pathname.startsWith("/event"))}
        </nav>

        {/* Right-side icon group */}
        <div
          className="relative flex flex-shrink-0 items-center gap-1 border-l border-gray-200 pl-3"
          ref={panelRef}
        >
          {/* Chat button */}
          <button
            type="button"
            onClick={() => {
              if (!user) {
                router.push("/login");
              } else {
                togglePanel("chat");
              }
            }}
            aria-label="Chat"
            aria-expanded={panel === "chat"}
            className={`rounded-full p-2 transition-colors hover:bg-gray-100 ${panel === "chat" ? "bg-gray-100" : ""}`}
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* Notifications button */}
          <button
            type="button"
            onClick={() => {
              if (!user) {
                router.push("/login");
              } else {
                togglePanel("notifications");
              }
            }}
            aria-label="Notifikasi"
            aria-expanded={panel === "notifications"}
            className={`rounded-full p-2 transition-colors hover:bg-gray-100 ${panel === "notifications" ? "bg-gray-100" : ""}`}
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.03 2.03 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Help button */}
          <button
            type="button"
            onClick={() => togglePanel("help")}
            aria-label="Bantuan"
            aria-expanded={panel === "help"}
            className={`rounded-full p-2 transition-colors hover:bg-gray-100 ${panel === "help" ? "bg-gray-100" : ""}`}
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Chat / Notifications / Help placeholder panel */}
          {(panel === "chat" || panel === "notifications" || panel === "help") && (
            <div className="absolute right-0 top-full z-[1200] mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
              <p className="mb-1 text-sm font-semibold text-[#1F2937]">
                {panel === "chat" ? "Chat komunitas" : panel === "notifications" ? "Notifikasi" : "Bantuan"}
              </p>
              <p className="text-xs leading-relaxed text-[#6B7280]">
                {panel === "chat"
                  ? "Chat komunitas dijadwalkan pada fase pengembangan berikutnya (PRD Fase 2)."
                  : panel === "notifications"
                  ? "Notifikasi aktivitas akan tersedia pada fase pengembangan berikutnya."
                  : "Pusat bantuan dan FAQ tersedia pada fase pengembangan berikutnya."}
              </p>
            </div>
          )}

          {/* Avatar + Account dropdown */}
          {!ready ? (
            <span className="h-9 w-9 animate-pulse rounded-full bg-gray-200 ml-1" aria-hidden />
          ) : user ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  if (e.detail > 1) return;
                  togglePanel("account");
                }}
                aria-haspopup="menu"
                aria-expanded={panel === "account"}
                aria-label="Menu akun"
                className="flex items-center rounded-full p-0.5 transition-colors hover:ring-2 hover:ring-[#7960D7] hover:ring-offset-1 focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:ring-offset-2 ml-1"
              >
                {/* Avatar circle */}
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "Avatar"}
                    draggable={false}
                    className="h-9 w-9 rounded-full object-cover select-none"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7960D7] text-sm font-bold text-white select-none">
                    {initial}
                  </span>
                )}

              </button>

              {/* Account dropdown */}
              {panel === "account" && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-[1200] mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-lg"
                >
                  {ACCOUNT_MENU.map((item) => (
                    <Link
                      key={item.href}
                      role="menuitem"
                      href={item.href}
                      onClick={() => setPanel(null)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-gray-50"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}

                  <div className="my-1 border-t border-gray-100" />

                  <div
                    role="menuitem"
                    aria-disabled="true"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed select-none"
                    title="Segera hadir"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                    <span className="ml-auto text-[10px] font-medium bg-gray-100 text-gray-400 rounded px-1.5 py-0.5">soon</span>
                  </div>

                  <div className="my-1 border-t border-gray-100" />

                  <form action={logout}>
                    <button
                      type="submit"
                      role="menuitem"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-[#1F2937] transition-colors hover:text-[#7960D7]"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[#7960D7] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6950c7]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
