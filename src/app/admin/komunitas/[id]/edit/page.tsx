import { notFound } from "next/navigation";
import Link from "next/link";
import { getCommunityForAdmin } from "@/server/admin";
import { CreateCommunityForm } from "@/app/komunitas/buat/CreateCommunityForm";

export default async function AdminEditCommunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const community = await getCommunityForAdmin(id);

  if (!community) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/admin/komunitas"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke kelola komunitas
      </Link>

      <h2 className="mb-1 text-xl font-bold text-[#1F2937]">Edit komunitas</h2>
      <p className="mb-6 text-sm text-[#6B7280]">{community.name}</p>

      <CreateCommunityForm
        isAdmin
        community={{
          id: community.id,
          name: community.name,
          description: community.description,
          type: community.type,
          accessType: community.accessType,
          categories: community.categories,
          area: community.location?.area ?? null,
          addressText: community.location?.addressText ?? null,
          avatarUrl: community.avatarUrl ?? null,
          bannerUrl: community.bannerUrl ?? null,
        }}
      />
    </div>
  );
}
