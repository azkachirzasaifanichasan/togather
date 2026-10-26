import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

export default async function KomunitasPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  // Get user's communities
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
    }
  });

  // Get all communities for discovery
  const allCommunities = await prisma.community.findMany({
    include: {
      _count: {
        select: { members: true }
      }
    },
    orderBy: {
      members: {
        _count: 'desc'
      }
    }
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
          
          <nav className="flex items-center gap-8">
            <Link href="/discovery" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/komunitas" className="text-[#7960D7] font-semibold">
              Community
            </Link>
            <Link href="/event" className="text-gray-600 hover:text-gray-900">
              Event
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
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
                {userCommunities.map((membership) => (
                  <Link
                    key={membership.community.id}
                    href={`/komunitas/${membership.community.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 group"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-700 font-semibold">
                        {membership.community.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {membership.community.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {membership.community._count.members} members
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-[#7960D7] opacity-0 group-hover:opacity-100 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                ))}
                {userCommunities.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No communities yet</p>
                )}
              </div>
            </div>

            {/* Create community button */}
            <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Create community
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Communities</h1>
            <p className="text-gray-600">Find and join communities that match your interests</p>
          </div>

          {/* Communities grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCommunities.map((community) => {
              const isMember = userCommunities.some(
                (m) => m.community.id === community.id
              );

              return (
                <Link
                  key={community.id}
                  href={`/komunitas/${community.id}`}
                  className="block group"
                >
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Community image */}
                    <div className="relative h-40 bg-gradient-to-br from-purple-400 to-purple-600">
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="absolute bottom-4 left-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-[#7960D7]">
                            {community.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Community info */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#7960D7] transition-colors">
                        {community.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {community.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          <span>{community._count.members} members</span>
                        </div>
                        {isMember && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#7960D7] bg-opacity-10 text-[#7960D7] text-xs font-semibold rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Joined
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {allCommunities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No communities found</p>
              <button className="px-6 py-3 bg-[#7960D7] text-white rounded-lg font-semibold hover:bg-[#6850C7] transition-colors">
                Create the first community
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
