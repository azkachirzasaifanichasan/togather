"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SessionUser {
  name?: string | null;
  email?: string | null;
}

interface HeaderProps {
  showSearch?: boolean;
}

type Panel = "chat" | "notifications" | null;

export function Header({ showSearch = true }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setUser(data?.user ?? null);
        setReady(true);
      })
      .catch(() => {
        if (active) setReady(true);
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

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

  const initial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex w-full items-center gap-4 px-5 py-3 lg:px-8">
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

        {showSearch && (
          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-center gap-2 md:flex md:max-w-xl"
            role="search"
          >
            <div className="relative flex-1">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari komunitas atau event..."
                aria-label="Cari komunitas atau event"
                className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
              />
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#1F2937] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Cari
            </button>
          </form>
        )}

        <nav className="ml-auto flex items-center gap-1">
          {navLink(homeHref, "Home", pathname === "/" || pathname === "/landing" || pathname === "/discovery")}
          {navLink("/komunitas", "Community", pathname.startsWith("/komunitas"))}
          {navLink("/event", "Event", pathname.startsWith("/event"))}
        </nav>

        <div className="relative flex flex-shrink-0 items-center gap-1 border-l border-gray-200 pl-3" ref={panelRef}>
          <button
            type="button"
            onClick={() => setPanel(panel === "chat" ? null : "chat")}
            aria-label="Chat"
            aria-expanded={panel === "chat"}
            className={`rounded-full p-2 transition-colors hover:bg-gray-100 ${
              panel === "chat" ? "bg-gray-100" : ""
            }`}
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setPanel(panel === "notifications" ? null : "notifications")}
            aria-label="Notifikasi"
            aria-expanded={panel === "notifications"}
            className={`rounded-full p-2 transition-colors hover:bg-gray-100 ${
              panel === "notifications" ? "bg-gray-100" : ""
            }`}
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.03 2.03 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {panel && (
            <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
              <p className="mb-1 text-sm font-semibold text-[#1F2937]">
                {panel === "chat" ? "Chat komunitas" : "Notifikasi"}
              </p>
              <p className="text-xs leading-relaxed text-[#6B7280]">
                {panel === "chat"
                  ? "Chat komunitas dijadwalkan pada fase pengembangan berikutnya (PRD Fase 2)."
                  : "Notifikasi aktivitas akan tersedia pada fase pengembangan berikutnya."}
              </p>
            </div>
          )}

          {!ready ? (
            <span className="h-9 w-9 animate-pulse rounded-full bg-gray-200" aria-hidden />
          ) : user ? (
            <Link
              href="/profile"
              title={user.name || user.email || "Profil"}
              className="flex items-center gap-2 pl-1"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7960D7] text-sm font-bold text-white">
                {initial || "U"}
              </span>
              <span className="hidden max-w-[130px] truncate text-sm font-medium text-[#1F2937] lg:inline">
                {user.name || "Profil"}
              </span>
            </Link>
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
