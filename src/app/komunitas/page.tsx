import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default async function KomunitasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const userCommunities = session
    ? await prisma.communityMembership.findMany({
        where: {
          userId: session.user.id,
          community: { submission: { status: "APPROVED" } },
        },
        include: {
          community: {
            include: {
              _count: { select: { members: true } },
            },
          },
        },
      })
    : [];

  const allCommunities = await prisma.community.findMany({
    where: {
      submission: { status: "APPROVED" },
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { description: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { members: true } },
      location: true,
    },
    orderBy: {
      members: { _count: "desc" },
    },
  });

  const memberIds = new Set(userCommunities.map((membership) => membership.community.id));

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

            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Komunitasmu</h3>
              <div className="space-y-2">
                {userCommunities.map((membership) => (
                  <Link
                    key={membership.community.id}
                    href={`/komunitas/${membership.community.id}`}
                    className="group flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <span className="font-semibold text-gray-700">
                        {membership.community.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {membership.community.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {membership.community._count.members} anggota
                      </p>
                    </div>
                  </Link>
                ))}
                {userCommunities.length === 0 && (
                  <p className="text-sm italic text-gray-500">
                    {session ? "Belum ada komunitas." : "Masuk untuk melihat komunitasmu."}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
              Ingin membuat komunitas? Pengajuan komunitas tersedia untuk pengguna terverifikasi.
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Jelajahi komunitas</h1>
            <p className="text-gray-600">
              {query
                ? `${allCommunities.length} komunitas cocok dengan “${query}”`
                : `${allCommunities.length} komunitas aktif di DIY`}
            </p>
          </div>

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
                        <span>{community._count.members} anggota</span>
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
