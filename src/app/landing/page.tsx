import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header / Navigation */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-[#7960D7] rounded-xl flex items-center justify-center">
                <Image
                  src="/logo-togather.png"
                  alt="Togather"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-[#1F2937]">Togather</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2 text-[#1F2937] hover:text-[#7960D7] font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-[#7960D7] hover:bg-[#6950c7] text-white rounded-full font-medium transition-colors shadow-sm"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-[#1F2937] leading-tight">
                The <span className="text-[#7960D7]">people</span> platform.
                <br />
                Where <span className="text-[#7960D7]">interests</span>
                <br />
                become <span className="text-[#7960D7]">friendships.</span>
              </h1>
              
              <p className="text-lg text-[#6B7280] leading-relaxed max-w-xl">
                Whatever your interest, from hiking and reading to networking and skill sharing, 
                there are thousands of people who share it on Togather. Events are happening every 
                day—sign up to join the fun.
              </p>

              <Link
                href="/register"
                className="inline-block px-8 py-4 bg-[#7960D7] hover:bg-[#6950c7] text-white rounded-full font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Join Togather
              </Link>
            </div>

            {/* Right Content - Illustrations */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-6">
                {/* Card 1 - Nice you */}
                <div className="bg-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#7960D7]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1F2937] mb-2">Nice you</h3>
                  <p className="text-sm text-[#6B7280]">Join communities that match your vibe</p>
                </div>

                {/* Card 2 - Dance Class */}
                <div className="bg-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform mt-8">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1F2937] mb-2">Dance Class</h3>
                  <p className="text-sm text-[#6B7280]">Discover events happening near you</p>
                </div>

                {/* Card 3 - Cycling Club */}
                <div className="bg-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1F2937] mb-2">Cycling Club</h3>
                  <p className="text-sm text-[#6B7280]">Connect with people who share your passion</p>
                </div>

                {/* Card 4 - Every Thursday */}
                <div className="bg-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform mt-8">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-[#1F2937] mb-2">Every Thursday</h3>
                  <p className="text-sm text-[#6B7280]">Regular meetups build lasting friendships</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#1F2937] mb-2">
                Upcoming events in Yogyakarta
              </h2>
              <p className="text-lg text-[#6B7280]">
                Discover what's happening in your area
              </p>
            </div>
            <Link
              href="/event"
              className="px-6 py-3 border-2 border-[#7960D7] text-[#7960D7] hover:bg-[#7960D7] hover:text-white rounded-full font-semibold transition-colors"
            >
              See all events
            </Link>
          </div>

          {/* Event Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400"></div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-2">
                    <span className="px-2 py-1 bg-purple-100 text-[#7960D7] rounded-full font-medium">
                      Free
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1F2937] mb-2 line-clamp-2">
                    Tech Meetup Yogyakarta
                  </h3>
                  <p className="text-sm text-[#6B7280] mb-3">
                    Sat, Dec 15 • 10:00 AM
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>24 attending</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Communities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#1F2937] mb-2">
                Popular communities
              </h2>
              <p className="text-lg text-[#6B7280]">
                Find your people and join the conversation
              </p>
            </div>
            <Link
              href="/komunitas"
              className="px-6 py-3 border-2 border-[#7960D7] text-[#7960D7] hover:bg-[#7960D7] hover:text-white rounded-full font-semibold transition-colors"
            >
              Explore communities
            </Link>
          </div>

          {/* Community Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Tech Yogyakarta", members: 1240, category: "Teknologi", color: "bg-blue-500" },
              { name: "Hiking DIY", members: 856, category: "Olahraga", color: "bg-green-500" },
              { name: "Fotografi Jogja", members: 2103, category: "Seni & Hiburan", color: "bg-purple-500" },
              { name: "Startup Community", members: 634, category: "Bisnis & Karier", color: "bg-orange-500" },
              { name: "Yoga & Wellness", members: 421, category: "Kesehatan", color: "bg-pink-500" },
              { name: "Book Club Jogja", members: 318, category: "Hobi", color: "bg-yellow-500" },
            ].map((community, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#7960D7] hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 ${community.color} rounded-xl flex items-center justify-center text-white font-bold text-2xl`}>
                    {community.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1F2937] mb-1">
                      {community.name}
                    </h3>
                    <p className="text-sm text-[#6B7280] mb-2">
                      {community.members.toLocaleString()} members
                    </p>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-[#6B7280] text-xs rounded-full">
                      {community.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#7960D7] to-[#6950c7] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            What are you waiting for?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join thousands of people discovering communities and events in Yogyakarta.
            Create your free account today and start connecting with people who share your interests.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white text-[#7960D7] hover:bg-gray-100 rounded-full font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Get started now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F2937] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#7960D7] rounded-xl flex items-center justify-center">
                  <Image
                    src="/logo-togather.png"
                    alt="Togather"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold">Togather</span>
              </div>
              <p className="text-sm text-gray-400">
                The people platform — where communities meet and events come alive.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Discover</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/komunitas" className="hover:text-white transition-colors">Communities</Link></li>
                <li><Link href="/event" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link href="/event" className="hover:text-white transition-colors">Online events</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Togather</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Help</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Follow us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2026 Togather. All rights reserved. Made with ♥ for communities everywhere.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Terms of service</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Cookie policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
