"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Left navigation for the admin area.
 *
 * Renders as a vertical list on desktop and a horizontal scroll strip on
 * phones, so the same markup serves both without a separate mobile nav.
 */
const ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 13h6v6H4v-6zm10 0h6v6h-6v-6z"
      />
    ),
  },
  {
    href: "/admin/komunitas",
    label: "Komunitas",
    exact: false,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  },
  {
    href: "/admin/event",
    label: "Event",
    exact: false,
    soon: true,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
  },
  {
    href: "/admin/pesan",
    label: "Pesan masuk",
    exact: false,
    soon: true,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
  },
];

export function AdminSidebar({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="lg:w-60 lg:shrink-0">
      <div className="rounded-2xl border border-gray-200 bg-white p-3 lg:sticky lg:top-24">
        <div className="px-3 pb-3">
          <p className="text-sm font-bold text-[#1F2937]">Admin Togather</p>
          <p className="text-xs text-[#6B7280]">Kelola komunitas &amp; event</p>
        </div>

        <p className="hidden px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 lg:block">
          Menu utama
        </p>

        <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            // The approval queue lives inside the community menu, so the
            // badge belongs on Komunitas — not on a separate nav entry.
            const badge = item.href === "/admin/komunitas" ? pendingCount : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#7960D7] text-white"
                    : "text-[#1F2937] hover:bg-[#F4F1FE]"
                }`}
              >
                <svg
                  className={`h-5 w-5 flex-shrink-0 ${
                    active ? "text-white" : "text-[#6B7280]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {item.icon}
                </svg>

                <span className="whitespace-nowrap">{item.label}</span>

                {badge > 0 && (
                  <span
                    className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
                      active ? "bg-white text-[#7960D7]" : "bg-[#7960D7] text-white"
                    }`}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}

                {item.soon && badge === 0 && (
                  <span
                    className={`ml-auto hidden rounded px-1.5 py-0.5 text-[10px] font-medium lg:inline ${
                      active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-3 hidden border-t border-gray-100 pt-3 lg:block">
          <Link
            href="/discovery"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#6B7280] transition-colors hover:bg-gray-50 hover:text-[#1F2937]"
          >
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Mode admin · kembali ke aplikasi
          </Link>
        </div>
      </div>
    </aside>
  );
}
