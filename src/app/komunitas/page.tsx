import { auth } from "@/lib/auth";
import { getDiscoveryCommunities, getUserCommunities } from "@/server/communities";
import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type MyCommunity = {
  id: string;
  name: string;
  memberCount: number;
};

function MyCommunityList({ communities }: { communities: MyCommunity[] }) {
  return (
    <div className="space-y-2">
      {communities.map((community) => (
        <Link
          key={community.id}
          href={`/komunitas/${community.id}`}
          className="group flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
            <span className="font-semibold text-gray-700">
              {community.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {community.name}
            </p>
            <p className="text-xs text-gray-500">{community.memberCount} anggota</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MyCommunitySection({
  title,
  communities,
  emptyText,
}: {
  title: string;
  communities: MyCommunity[];
  emptyText: string;
}) {
  if (communities.length === 0 && !emptyText) return null;

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      <MyCommunityList communities={communities} />
      {communities.length === 0 && emptyText && (
        <p className="text-sm italic text-gray-500">{emptyText}</p>
      )}
    </div>
  );
}

export default async function KomunitasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const userCommunities = session ? await getUserCommunities(session.user.id) : [];
  const allCommunities = await getDiscoveryCommunities(query ? { search: query } : {});

  const memberIds = new Set(userCommunities.map((c) => c.id));

  // Komunitas yang dibuat user (dia organizer) vs yang hanya diikuti
  const ownedCommunities = userCommunities.filter((c) => c.isOrganizer);
  const joinedCommunities = userCommunities.filter((c) => !c.isOrganizer);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-24">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Community</h2>

            <form action="/komunitas" method="get" className="mb-6">
              <div className="relative">
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Cari komunitas"
                  aria-label="Cari komunitas"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            <MyCommunitySection
              title="Dibuat olehmu"
              communities={ownedCommunities}
              emptyText={session ? "Belum ada komunitas yang kamu buat." : "Masuk untuk melihat komunitasmu."}
            />
            <MyCommunitySection
              title="Diikuti"
              communities={joinedCommunities}
              emptyText={session ? "Belum ada komunitas yang kamu ikuti." : "Masuk untuk melihat komunitasmu."}
            />

            <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
              Ingin membuat komunitas?{" "}
              <Link href="/komunitas/buat" className="font-semibold text-[#7960D7] hover:underline">
                Ajukan di sini
              </Link>
              . Pengajuan tersedia untuk pengguna terverifikasi.
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Jelajahi komunitas</h1>
              <p className="text-gray-600">
                {query
                  ? `${allCommunities.length} komunitas cocok dengan "${query}"`
                  : `${allCommunities.length} komunitas aktif di DIY`}
              </p>
            </div>
            <Link
              href="/komunitas/buat"
              className="inline-flex items-center gap-2 rounded-lg bg-[#7960D7] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6850C7]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat komunitas
            </Link>
          </div>

          {/* Search bar for mobile */}
          <form action="/komunitas" method="get" className="mb-6 lg:hidden">
            <div className="relative">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Cari komunitas"
                aria-label="Cari komunitas"
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#7960D7]"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Komunitasmu untuk mobile — sidebar desktop disembunyikan di layar kecil */}
          {userCommunities.length > 0 && (
            <div className="mb-6 lg:hidden">
              <MyCommunitySection
                title="Dibuat olehmu"
                communities={ownedCommunities}
                emptyText=""
              />
              <MyCommunitySection
                title="Diikuti"
                communities={joinedCommunities}
                emptyText=""
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allCommunities.map((community) => (
              <Link key={community.id} href={`/komunitas/${community.id}`} className="group block">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
                  <div className="relative h-32 bg-gradient-to-br from-purple-400 to-purple-600">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-4 left-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
                        <span className="text-xl font-bold text-[#7960D7]">
                          {community.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#7960D7]">
                      {community.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{community.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>{community.memberCount} anggota</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {community.type === "ONLINE" ? "Online" : "Offline"}
                        </span>
                        {memberIds.has(community.id) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#7960D7]/10 px-2 py-1 text-xs font-semibold text-[#7960D7]">
                            Diikuti
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {allCommunities.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
              <p className="mb-2 text-lg font-semibold text-gray-900">
                {query ? "Tidak ada komunitas yang cocok" : "Belum ada komunitas"}
              </p>
              <p className="mb-6 text-sm text-gray-600">
                {query
                  ? "Coba kata kunci lain atau jelajahi lewat peta."
                  : "Komunitas yang disetujui admin akan muncul di sini."}
              </p>
              <Link
                href="/discovery"
                className="inline-block rounded-lg bg-[#7960D7] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6850C7]"
              >
                Jelajahi lewat peta
              </Link>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
