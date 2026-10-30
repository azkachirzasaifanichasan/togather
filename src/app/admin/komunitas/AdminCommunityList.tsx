"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Area, InterestCategory } from "@prisma/client";
import { AREA_LABELS, INTEREST_LABELS } from "@/lib/community-labels";
import { AdminCommunityActions } from "./AdminCommunityActions";

export type AdminCommunityRow = {
  id: string;
  name: string;
  description: string;
  type: "ONLINE" | "OFFLINE";
  accessType: "PUBLIC" | "PRIVATE";
  categories: InterestCategory[];
  area: Area | null;
  memberCount: number;
  organizerCount: number;
  eventCount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
};

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "APPROVED", label: "Aktif" },
  { key: "PENDING", label: "Menunggu review" },
  { key: "REJECTED", label: "Ditolak" },
  { key: "none", label: "Tanpa pengajuan" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

/**
 * The full community table with a text filter and status chips.
 *
 * Filtering happens in the browser: the admin dataset is small and this keeps
 * the page a single server request. The action buttons are the same client
 * component the list used before.
 */
export function AdminCommunityList({ rows }: { rows: AdminCommunityRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const tally: Record<string, number> = { all: rows.length, none: 0 };
    for (const row of rows) {
      tally[row.status ?? "none"] = (tally[row.status ?? "none"] ?? 0) + 1;
    }
    return tally;
  }, [rows]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "all" && (row.status ?? "none") !== filter) return false;
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        row.description.toLowerCase().includes(needle) ||
        row.categories.some((category) =>
          INTEREST_LABELS[category].toLowerCase().includes(needle)
        )
      );
    });
  }, [rows, query, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama atau deskripsi komunitas"
            aria-label="Cari komunitas"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-[#1F2937] placeholder-gray-400 focus:border-[#7960D7] focus:outline-none focus:ring-1 focus:ring-[#7960D7]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = filter === item.key;
          const count = counts[item.key] ?? 0;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "bg-[#7960D7] text-white"
                  : "border border-gray-200 bg-white text-[#6B7280] hover:bg-gray-50"
              }`}
            >
              {item.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {visible.length === 0 && (
          <p className="p-8 text-center text-sm text-gray-500">
            {rows.length === 0
              ? "Belum ada komunitas."
              : "Tidak ada komunitas yang cocok dengan filter ini."}
          </p>
        )}

        {visible.map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 p-4 last:border-b-0"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EEE9FF] font-semibold text-[#7960D7]">
                {row.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/komunitas/${row.id}`}
                    className="truncate font-semibold text-[#1F2937] hover:text-[#7960D7]"
                  >
                    {row.name}
                  </Link>
                  <StatusPill status={row.status} />
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-[#6B7280]">
                  {row.description}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {row.categories.map((category) => INTEREST_LABELS[category]).join(", ")}
                  {row.area ? ` · ${AREA_LABELS[row.area]}` : ""} · {row.memberCount}{" "}
                  anggota · {row.organizerCount} pengurus · {row.eventCount} event ·{" "}
                  {row.type === "ONLINE" ? "Online" : "Offline"} ·{" "}
                  {row.accessType === "PUBLIC" ? "Publik" : "Privat"}
                </p>
              </div>
            </div>

            <AdminCommunityActions communityId={row.id} name={row.name} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: AdminCommunityRow["status"] }) {
  const styles =
    status === "APPROVED"
      ? "bg-green-50 text-green-700"
      : status === "PENDING"
        ? "bg-amber-50 text-amber-700"
        : status === "REJECTED"
          ? "bg-red-50 text-red-700"
          : "bg-gray-100 text-gray-600";

  const label =
    status === "APPROVED"
      ? "Aktif"
      : status === "PENDING"
        ? "Menunggu review"
        : status === "REJECTED"
          ? "Ditolak"
          : "Tanpa pengajuan";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}
