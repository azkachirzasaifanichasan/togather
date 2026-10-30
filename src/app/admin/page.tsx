import Link from "next/link";
import { getAdminOverview } from "@/server/admin";
import { INTEREST_LABELS, submissionLabel, submissionClass } from "@/lib/community-labels";

/**
 * Admin dashboard: the numbers an admin wants at a glance, plus the shortest
 * path to the review queue.
 */
export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  const stats = [
    {
      label: "Komunitas terdaftar",
      value: overview.total,
      hint: `${overview.byStatus.APPROVED} aktif`,
      accent: "text-[#1F2937]",
    },
    {
      label: "Menunggu review",
      value: overview.pendingCount,
      hint: overview.pendingCount > 0 ? "Perlu tindakan" : "Semua beres",
      accent: overview.pendingCount > 0 ? "text-amber-600" : "text-[#1F2937]",
      warn: overview.pendingCount > 0,
    },
    {
      label: "Anggota komunitas",
      value: overview.memberCount,
      hint: "Total keanggotaan",
      accent: "text-[#1F2937]",
    },
    {
      label: "Event terdaftar",
      value: overview.eventCount,
      hint: "Seluruh event",
      accent: "text-[#1F2937]",
    },
  ];

  const maxCategory = Math.max(1, ...overview.topCategories.map((c) => c.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Ikhtisar komunitas</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Pantau jumlah komunitas, anggota, dan pengajuan yang menunggu persetujuan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/komunitas?tab=approval"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#1F2937] transition-colors hover:bg-gray-50"
          >
            Lihat pengajuan
            {overview.pendingCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#7960D7] px-1.5 text-[11px] font-bold text-white">
                {overview.pendingCount}
              </span>
            )}
          </Link>
          <Link
            href="/komunitas/buat"
            className="inline-flex items-center gap-2 rounded-lg bg-[#7960D7] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6850C7]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah komunitas
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              {stat.label}
            </p>
            <p className={`mt-2 text-3xl font-bold ${stat.accent}`}>
              {stat.value.toLocaleString("id-ID")}
            </p>
            <p
              className={`mt-1 text-xs font-medium ${
                stat.warn ? "text-amber-600" : "text-[#6B7280]"
              }`}
            >
              {stat.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category spread */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-bold text-[#1F2937]">Kategori terbanyak</h2>
          <p className="mt-1 text-xs text-[#6B7280]">
            Komunitas dikelompokkan menurut kategori minatnya.
          </p>

          {overview.topCategories.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">Belum ada komunitas.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {overview.topCategories.map((row) => (
                <li key={row.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-[#1F2937]">
                      {INTEREST_LABELS[row.category]}
                    </span>
                    <span className="font-semibold text-[#6B7280]">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#7960D7]"
                      style={{ width: `${Math.round((row.count / maxCategory) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recently added */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1F2937]">Komunitas terbaru</h2>
            <Link
              href="/admin/komunitas"
              className="text-xs font-semibold text-[#7960D7] hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {overview.recent.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">Belum ada komunitas.</p>
          ) : (
            <ul className="mt-4 divide-y divide-gray-100">
              {overview.recent.map((community) => {
                const status = community.submission?.status ?? null;
                return (
                  <li
                    key={community.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/komunitas/${community.id}/edit`}
                        className="block truncate text-sm font-semibold text-[#1F2937] hover:text-[#7960D7]"
                      >
                        {community.name}
                      </Link>
                      <p className="text-xs text-[#6B7280]">
                        {community.createdAt.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${submissionClass(status)}`}
                    >
                      {submissionLabel(status)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
