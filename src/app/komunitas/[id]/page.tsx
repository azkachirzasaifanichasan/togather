import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCommunityProfileById } from "@/server/communities";
import { getCommunityPosts, canPostInCommunity } from "@/server/posts";
import { getNotificationLevel } from "@/server/notifications";
import Link from "next/link";
import Image from "next/image";

import { Header } from "@/components/Header";
import { JoinButton } from "@/components/communities/JoinButton";
import { CommunityFeed } from "@/components/communities/CommunityFeed";
import { NotificationLevelMenu } from "@/components/communities/NotificationLevelMenu";

export default async function CommunityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const community = await getCommunityProfileById(id, session.user.id);

  if (!community) {
    notFound();
  }

  const admin = community.hosts[0];
  const isMember = community.isMember;
  const isOrganizer = community.hosts.length > 0;

  // Members and organizers see the feed; in a private community nobody else
  // may read the posts.
  const canViewFeed = isMember || isOrganizer;
  const [posts, canPost, notificationLevel] = await Promise.all([
    canViewFeed
      ? getCommunityPosts(id, session.user.id)
      : Promise.resolve([]),
    canPostInCommunity(session.user.id, id),
    getNotificationLevel(session.user.id, id),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Main content */}
        <main className="min-w-0">
          <Link
            href="/komunitas"
            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to communities
          </Link>

          {/* Community header image */}
          <div className="relative h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 mb-8">
            <div className="absolute inset-0 bg-black/20" />
            <Image
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
              alt={community.name}
              fill
              sizes="(max-width: 768px) 100vw, 1280px"
              className="object-cover"
            />
          </div>

          {/* Community info */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-gray-900">{community.name}</h2>
              <p className="max-w-2xl text-lg leading-relaxed text-gray-600">
                {community.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7960D7]">
                  {community.memberCount} anggota
                </span>
                <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                  {community.accessType === "PUBLIC" ? "Publik" : "Privat"}
                </span>
                <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                  {community.type === "ONLINE" ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {isMember && (
                <NotificationLevelMenu
                  communityId={community.id}
                  initialLevel={notificationLevel}
                />
              )}
              <JoinButton
                communityId={community.id}
                communityName={community.name}
                isMember={isMember}
                accessType={community.accessType}
                isLoggedIn={Boolean(session?.user)}
                initialRequestStatus={null}
              />
            </div>
          </div>

          {/* Hosted by */}
          <div>
            <h3 className="mb-6 text-2xl font-bold text-gray-900">Hosted by</h3>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                  <span className="text-lg font-bold text-white">
                    {admin?.name?.charAt(0).toUpperCase() || "A"}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{admin?.name || "Anonymous"}</p>
                  <p className="text-sm text-gray-600">Pembuat komunitas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Postingan */}
          <div className="mt-12">
            <h3 className="mb-6 text-2xl font-bold text-gray-900">Postingan</h3>
            {canViewFeed ? (
              <CommunityFeed
                communityId={community.id}
                canPost={canPost}
                initialPosts={posts}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center">
                <p className="text-sm font-semibold text-gray-900">
                  Postingan hanya untuk anggota
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Gabung komunitas ini untuk melihat dan membuat postingan.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
