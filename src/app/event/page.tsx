import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { AccountMenu } from '@/components/AccountMenu';
import Image from 'next/image';

export default async function EventPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const { tab } = await searchParams;
  const activeTab = tab || 'going';

  // Get user's event registrations (only if logged in)
  const userRegistrations = session
    ? await prisma.eventRegistration.findMany({
        where: {
          userId: session.user.id,
          cancelledAt: null, // Only non-cancelled
        },
        include: {
          event: {
            include: {
              relatedCommunities: {
                include: {
                  community: true
                }
              },
            },
          },
        },
      })
    : [];

  // Filter events based on tab
  const now = new Date();
  const goingEvents = userRegistrations
    .filter(reg => new Date(reg.event.startDate) >= now)
    .map(reg => ({
      ...reg.event,
      community: reg.event.relatedCommunities[0]?.community
    }));

  // For "saved" we'll use same as going for now (can add wishlist later)
  const savedEvents = goingEvents;

  const pastEvents = userRegistrations
    .filter(reg => new Date(reg.event.startDate) < now)
    .map(reg => ({
      ...reg.event,
      community: reg.event.relatedCommunities[0]?.community
    }));

  const currentEvents = activeTab === 'going' ? goingEvents : activeTab === 'saved' ? savedEvents : pastEvents;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={session ? "/discovery" : "/landing"} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7960D7] rounded-lg flex items-center justify-center p-1">
              <Image
                src="/logo-togather.png"
                alt="Togather"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-900">Togather</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Sewon, ID"
                  className="w-40 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
                />
              </div>
              <button className="px-6 py-2 bg-gray-900 text-white rounded-r-lg hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          <nav className="flex items-center gap-8">
            <Link href={session ? "/discovery" : "/landing"} className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/komunitas" className="text-gray-600 hover:text-gray-900">
              Community
            </Link>
            <Link href="/event" className="text-[#7960D7] font-semibold px-6 py-2 bg-[#7960D7] bg-opacity-10 rounded-full">
              Event
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <AccountMenu
              initialUser={
                session?.user
                  ? {
                      name: session.user.name || session.user.email || 'User',
                      email: session.user.email,
                      avatarUrl: null,
                      isAdmin: session.user.isAdmin ?? false,
                    }
                  : null
              }
            />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back to home */}
        <Link
          href="/discovery"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>

        {/* Header with Add to calendar */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Your events</h1>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-900 font-medium">Add to calendar</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-8 border-b border-gray-200">
          <Link
            href="/event?tab=going"
            className={`pb-4 px-2 font-semibold transition-colors relative ${
              activeTab === 'going'
                ? 'text-white bg-[#7960D7] rounded-t-lg px-6 -mb-px'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Going
          </Link>
          <Link
            href="/event?tab=saved"
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === 'saved'
                ? 'text-white bg-[#7960D7] rounded-t-lg px-6 -mb-px'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Saved
          </Link>
          <Link
            href="/event?tab=past"
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === 'past'
                ? 'text-white bg-[#7960D7] rounded-t-lg px-6 -mb-px'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past
          </Link>

          {/* Search and Today filter */}
          <div className="ml-auto flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <span className="text-gray-900 font-medium">Today</span>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Events content */}
        {currentEvents.length === 0 ? (
          <div className="text-center py-16">
            {/* Empty state illustration */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                {/* Cute elephant illustration placeholder */}
                <div className="w-48 h-48 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-[#7960D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-purple-200 rounded-full"></div>
                <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-purple-300 rounded-full"></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No plans yet? Let's fix that
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explore fresh events and find something exciting to join.
            </p>
            <Link
              href="/discovery"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Discover events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {currentEvents.map((event) => {
              const eventDate = new Date(event.startDate);
              const day = eventDate.getDate();
              const month = eventDate.toLocaleString('en', { month: 'short' }).toUpperCase();
              
              return (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="block group"
                >
                  <div className="flex gap-6 p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                    {/* Date badge */}
                    <div className="w-20 h-20 bg-[#7960D7] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-3xl font-bold text-white">{day}</span>
                      <span className="text-xs text-purple-200">{month}</span>
                    </div>

                    {/* Event info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#7960D7] transition-colors">
                        {event.name}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{event.startTime || 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.venue || 'TBA'}</span>
                        </div>
                        {event.community && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <span>{event.community.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Share functionality');
                        }}
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#7960D7] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-xl font-bold">Togather</span>
              </div>
              <p className="text-gray-400 text-sm">
                The people platform — where communities meet and events come alive.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Your account</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/register" className="hover:text-white">Sign up</Link></li>
                <li><Link href="/login" className="hover:text-white">Log in</Link></li>
                <li><a href="#" className="hover:text-white">Help</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Discover</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/komunitas" className="hover:text-white">Community</Link></li>
                <li><Link href="/event" className="hover:text-white">Events</Link></li>
                <li><a href="#" className="hover:text-white">Topics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Togather</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex items-center justify-between text-sm text-gray-400">
            <p>© 2026 Togather. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white">Terms of service</a>
              <a href="#" className="hover:text-white">Privacy policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
