import Link from "next/link";
import { getAllCommunitiesForAdmin, getPendingSubmissions } from "@/server/admin";
import { AdminCommunityList } from "./AdminCommunityList";
import { AdminApprovalQueue } from "./AdminApprovalQueue";

type Tab = "semua" | "approval";

/**
 * Community manager.
 *
 * Two views share one route: the full list (default) and the approval queue,
 * switched with `?tab=approval` so the browser back button works and the URL
 * can be shared. The queue count comes from the same query the list uses.
 */
export default async function AdminKomunitasPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const view: Tab = tab === "approval" ? "approval" : "semua";

  const [communities, pending] = await Promise.all([
    getAllCommunitiesForAdmin(),
    getPendingSubmissions(),
  ]);

  const rows = communities.map((community) => ({
    id: community.id,
    name: community.name,
    description: community.description,
    type: community.type,
    accessType: community.accessType,
    categories: community.categories,
    area: community.location?.area ?? null,
    memberCount: community._count.members,
    organizerCount: community._count.organizers,
    eventCount: community._count.events,
    status: community.submission?.status ?? null,
  }));

  return (
    <div className="space-y-5">
      {view === "approval" ? (
        <>
          <Link
            href="/admin/komunitas"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#1F2937]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali ke semua komunitas
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Approval komunitas</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              {pending.length === 0
                ? "Tidak ada pengajuan yang menunggu persetujuan."
                : `${pending.length} pengajuan menunggu persetujuanmu.`}
            </p>
          </div>

          <AdminApprovalQueue
            submissions={pending.map((submission) => ({
              id: submission.id,
              communityId: submission.communityId,
              submittedAt: submission.submittedAt.toISOString(),
              community: {
                id: submission.community.id,
                name: submission.community.name,
                description: submission.community.description,
                type: submission.community.type,
                accessType: submission.community.accessType,
                categories: submission.community.categories,
                area: submission.community.location?.area ?? null,
                addressText: submission.community.location?.addressText ?? null,
                memberCount: submission.community._count.members,
              },
              submitter: {
                name: submission.submitter.profile?.name ?? null,
                email: submission.submitter.email,
              },
            }))}
          />
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2937]">Manajemen komunitas</h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                {rows.length} komunitas terdaftar (semua status). Kelola data, atau
                buka antrean persetujuan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/komunitas?tab=approval"
                className="relative inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#1F2937] transition-colors hover:bg-gray-50"
              >
                Approval
                {pending.length > 0 && (
                  <span
                    aria-label={`${pending.length} pengajuan menunggu`}
                    className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#7960D7] px-1.5 text-[11px] font-bold text-white"
                  >
                    {pending.length > 99 ? "99+" : pending.length}
                  </span>
                )}
              </Link>

              <Link
                href="/komunitas/buat"
                className="inline-flex items-center gap-2 rounded-lg bg-[#7960D7] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6850C7]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah komunitas
              </Link>
            </div>
          </div>

          <AdminCommunityList rows={rows} />
        </>
      )}
    </div>
  );
}
