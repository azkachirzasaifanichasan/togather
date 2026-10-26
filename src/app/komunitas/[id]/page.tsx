import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

export default async function CommunityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  const community = await prisma.community.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  name: true
                }
              }
            }
          },
        },
      },
      organizers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      },
      events: {
        include: {
          event: true
        }
      },
    },
  });

  if (!community) {
    notFound();
  }

  // Extract upcoming events from EventCommunity relation
  const now = new Date();
  const upcomingEvents = community.events
    .map(ec => ec.event)
    .filter(event => event.isPublished && new Date(event.startDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  // Get admin from first organizer
  const admin = community.organizers[0]?.user;

  const isMember = community.members.some(m => m.userId === session.user.id);

  // Get user's communities for sidebar
  const userCommunities = await prisma.communityMembership.findMany({
    where: { userId: session.user.id },
    include: {
      community: {
        include: {
          _count: {
            select: { members: true }
          }
        }
      }
    },
    take: 4
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/discovery" className="flex items-center gap-2">
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
          
          <Link 
            href="/discovery" 
            className="flex items-center gap-2 px-4 py-2 bg-[#7960D7] text-white rounded-lg hover:bg-[#6850C7] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/event" className="text-[#7960D7] font-semibold hover:underline">
              Event
            </Link>
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
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {session.user.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community</h2>
            
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search communities"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent text-sm"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Your community */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your community</h3>
              <div className="space-y-2">
                {userCommunities.map((membership) => {
                  const isActive = membership.community.id === community.id;
                  return (
                    <Link
                      key={membership.community.id}
                      href={`/komunitas/${membership.community.id}`}
                      className={`flex items-center gap-3 p-2 rounded-lg group ${
                        isActive ? 'bg-[#7960D7] bg-opacity-10' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-[#7960D7]' : 'bg-gray-200'
                      }`}>
                        <span className={`font-semibold ${
                          isActive ? 'text-white' : 'text-gray-700'
                        }`}>
                          {membership.community.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          isActive ? 'text-[#7960D7]' : 'text-gray-900'
                        }`}>
                          {membership.community.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {membership.community._count.members} members
                        </p>
                      </div>
                      {isActive && (
                        <svg className="w-5 h-5 text-[#7960D7] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Create community button */}
            <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm">
              Create community
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Community</h1>
          
          {/* Back button */}
          <Link
            href="/komunitas"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to communities
          </Link>

          {/* Community header with image */}
          <div className="relative h-64 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl overflow-hidden mb-8">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <Image
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
              alt={community.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Community info */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{community.name}</h2>
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                {community.description}
              </p>
            </div>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              {isMember ? 'Leave community' : 'Join community'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-[#7960D7] text-white rounded-2xl p-6">
              <p className="text-5xl font-bold mb-2">{community.members.length}</p>
              <p className="text-purple-100 text-sm">members</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
              <p className="text-5xl font-bold text-gray-900 mb-2">{upcomingEvents.length}</p>
              <p className="text-gray-600 text-sm">upcoming events</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
              <p className="text-5xl font-bold text-gray-900 mb-2">4.9</p>
              <p className="text-gray-600 text-sm">avg rating</p>
            </div>
          </div>

          {/* Upcoming events */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upcoming events</h3>
              <Link href="/event" className="text-[#7960D7] font-semibold hover:underline">
                See all
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const eventDate = new Date(event.startDate);
                const day = eventDate.getDate();
                const month = eventDate.toLocaleString('en', { month: 'short' }).toUpperCase();
                
                return (
                  <Link
                    key={event.id}
                    href={`/event/${event.id}`}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
                  >
                    <div className="w-16 h-16 bg-[#7960D7] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-white">{day}</span>
                      <span className="text-xs text-purple-200">{month}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 group-hover:text-[#7960D7] transition-colors">
                        {event.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.startTime || 'TBA'} • {event.venue || 'TBA'}
                      </p>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </Link>
                );
              })}
              {upcomingEvents.length === 0 && (
                <p className="text-gray-500 text-center py-8">No upcoming events</p>
              )}
            </div>
          </div>

          {/* Hosted by */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Hosted by</h3>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {admin?.profile?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{admin?.profile?.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-600">
                    Community host • {upcomingEvents.length} events hosted
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
          </div>
        </main>

        {/* Right sidebar - Actions */}
        <aside className="w-16 flex-shrink-0">
          <div className="sticky top-8 flex flex-col gap-4">
            <button className="p-3 hover:bg-gray-100 rounded-lg" title="Share">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button className="p-3 hover:bg-gray-100 rounded-lg" title="More options">
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
