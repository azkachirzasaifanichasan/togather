"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-[#7960D7] rounded-xl flex items-center justify-center">
              <Image
                src="/logo-togather.png"
                alt="Togather"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-lg font-bold text-[#1F2937]">Togather</span>
          </Link>

          {/* Search Bar + Location */}
          <div className="flex-1 flex gap-2 max-w-md">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Sewon, ID"
              className="px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#7960D7] focus:border-transparent w-32"
            />
            <button className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-r-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                pathname === "/" || pathname === "/landing" || pathname === "/discovery"
                  ? "bg-[#7960D7] text-white"
                  : "text-[#1F2937] hover:bg-gray-100"
              }`}
            >
              Home
            </Link>
            <Link
              href="/komunitas"
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                pathname === "/komunitas"
                  ? "bg-[#7960D7] text-white"
                  : "text-[#1F2937] hover:bg-gray-100"
              }`}
            >
              Community
            </Link>
            <Link
              href="/event"
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                pathname === "/event"
                  ? "bg-[#7960D7] text-white"
                  : "text-[#1F2937] hover:bg-gray-100"
              }`}
            >
              Event
            </Link>
          </nav>

          {/* Icons and User */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <div className="w-10 h-10 bg-[#E82B60] rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-[#d6255a] transition-colors">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
