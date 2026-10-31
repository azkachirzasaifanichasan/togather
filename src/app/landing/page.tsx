import Link from "next/link";
import Image from "next/image";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const UPCOMING_EVENTS = [
  {
    id: "1",
    title: "Tech Meetup Yogyakarta: AI & Web Development",
    category: "Teknologi",
    date: "Sabtu, 15 Nov • 10:00 WIB",
    location: "Sleman, Yogyakarta",
    price: "Free",
    attendees: 48,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    title: "Sunrise Hiking & Merapi Nature Exploration",
    category: "Olahraga",
    date: "Minggu, 16 Nov • 05:00 WIB",
    location: "Kaliurang, Sleman",
    price: "Rp 50.000",
    attendees: 32,
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    title: "Jogja Creative Art & Batik Craft Workshop",
    category: "Seni & Budaya",
    date: "Sabtu, 22 Nov • 13:30 WIB",
    location: "Kotagede, Yogyakarta",
    price: "Free",
    attendees: 24,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    title: "Jogja Coffee Tasting & Barista Jam Session",
    category: "Kuliner",
    date: "Jumat, 28 Nov • 19:00 WIB",
    location: "Prawirotaman, Yogyakarta",
    price: "Rp 35.000",
    attendees: 56,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
  },
];

const POPULAR_COMMUNITIES = [
  {
    name: "Tech Yogyakarta",
    members: 1240,
    category: "Teknologi",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&auto=format&fit=crop&q=80",
  },
  {
    name: "Hiking DIY",
    members: 856,
    category: "Olahraga",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=80",
  },
  {
    name: "Fotografi Jogja",
    members: 2103,
    category: "Seni & Hiburan",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=300&auto=format&fit=crop&q=80",
  },
  {
    name: "Startup Community",
    members: 634,
    category: "Bisnis & Karier",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&auto=format&fit=crop&q=80",
  },
  {
    name: "Yoga & Wellness",
    members: 421,
    category: "Kesehatan",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&auto=format&fit=crop&q=80",
  },
  {
    name: "Book Club Jogja",
    members: 318,
    category: "Hobi",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80",
  },
];

export default async function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

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
                day sign up to join the fun.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-block px-8 py-4 bg-[#7960D7] hover:bg-[#6950c7] text-white rounded-full font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Join Togather
                </Link>
                <Link
                  href="/discovery"
                  className="inline-block px-8 py-4 bg-[#1F2937] hover:bg-[#111827] text-white rounded-full font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Discovery
                </Link>
              </div>
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
                Discover what&apos;s happening in your area
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
            {UPCOMING_EVENTS.map((event) => (
              <Link
                key={event.id}
                href="/event"
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-sm ${
                      event.price === "Free" ? "bg-emerald-500/90 text-white" : "bg-white/95 text-[#7960D7]"
                    }`}>
                      {event.price}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm text-white rounded-full">
                      {event.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[#1F2937] mb-2 line-clamp-2 group-hover:text-[#7960D7] transition-colors leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-sm text-[#6B7280] mb-2">
                      {event.date}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-3">
                      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#6B7280] pt-3 border-t border-gray-100">
                    <svg className="w-4 h-4 text-[#7960D7] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{event.attendees} attending</span>
                  </div>
                </div>
              </Link>
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
            {POPULAR_COMMUNITIES.map((community, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-[#7960D7] hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
                    <Image
                      src={community.image}
                      alt={community.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1F2937] mb-1 truncate group-hover:text-[#7960D7] transition-colors">
                      {community.name}
                    </h3>
                    <p className="text-sm text-[#6B7280] mb-2">
                      {community.members.toLocaleString()} members
                    </p>
                    <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-[#7960D7] text-xs font-medium rounded-full">
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

      <Footer />
    </div>
  );
}
