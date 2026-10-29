import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCommunityProfileById, getUserCommunities } from "@/server/communities";
import Link from "next/link";
import Image from "next/image";

import { Header } from "@/components/Header";
import { JoinButton } from "@/components/communities/JoinButton";

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

  const { upcomingEvents } = community;
  const admin = community.hosts[0];
  const isMember = community.isMember;

  // Get user's communities for sidebar
  const userCommunities = (await getUserCommunities(session.user.id)).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Community</h2>

            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search communities"
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
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Your community</h3>
              <div className="space-y-2">
                {userCommunities.map((membership) => {
                  const isActive = membership.id === community.id;
                  return (
                    <Link
                      key={membership.id}
                      href={`/komunitas/${membership.id}`}
                      className={`flex items-center gap-3 rounded-lg p-2 group ${
                        isActive ? "bg-[#7960D7]/10" : "hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          isActive ? "bg-[#7960D7]" : "bg-gray-200"
                        }`}
                      >
                        <span className={`font-semibold ${isActive ? "text-white" : "text-gray-700"}`}>
                          {membership.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-semibold ${isActive ? "text-[#7960D7]" : "text-gray-900"}`}>
                          {membership.name}
                        </p>
                        <p className="text-xs text-gray-500">{membership.memberCount} members</p>
                      </div>
                      {isActive && (
                        <svg className="h-5 w-5 flex-shrink-0 text-[#7960D7]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 max-w-4xl">
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
              sizes="(max-width: 768px) 100vw, 768px"
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
            </div>
            <JoinButton
              communityId={community.id}
              isMember={isMember}
              accessType={community.accessType}
              isLoggedIn={Boolean(session?.user)}
              initialRequestStatus={null}
            />
          </div>

          {/* Stats */}
          <div className="mb-12 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#7960D7] p-6 text-white">
              <p className="mb-2 text-5xl font-bold">{community.memberCount}</p>
              <p className="text-sm text-purple-100">members</p>
            </div>
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
              <p className="mb-2 text-5xl font-bold text-gray-900">{upcomingEvents.length}</p>
              <p className="text-sm text-gray-600">upcoming events</p>
            </div>
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
              <p className="mb-2 text-2xl font-bold text-gray-900">
                {community.accessType === "PUBLIC" ? "Publik" : "Privat"}
              </p>
              <p className="text-sm text-gray-600">
                {community.type === "ONLINE" ? "Komunitas online" : "Komunitas offline"}
              </p>
            </div>
          </div>

          {/* Upcoming events */}
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Upcoming events</h3>
              <Link href="/event" className="font-semibold text-[#7960D7] hover:underline">
                See all
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const eventDate = new Date(event.startDate);
                const day = eventDate.getDate();
                const month = eventDate.toLocaleString("en", { month: "short" }).toUpperCase();

                return (
                  <Link
                    key={event.id}
                    href={`/event/${event.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-[#7960D7]">
                      <span className="text-2xl font-bold text-white">{day}</span>
                      <span className="text-xs text-purple-200">{month}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 transition-colors group-hover:text-[#7960D7]">
                        {event.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {event.startTime || "TBA"} · {event.venue || "TBA"}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-[#7960D7] group-hover:underline">
                      Detail
                    </span>
                  </Link>
                );
              })}
              {upcomingEvents.length === 0 && (
                <p className="py-8 text-center text-gray-500">No upcoming events</p>
              )}
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
                  <p className="text-sm text-gray-600">
                    Community host · {upcomingEvents.length} events hosted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
