"use client";

import Link from "next/link";
import { InterestCategory } from "@prisma/client";
import { useState } from "react";

interface EventCardProps {
  event: {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    startTime?: string | null;
    venue?: string | null;
    area?: string | null;
    category?: InterestCategory;
    quota?: number | null;
    fee?: string | null;
    organizer?: string | null;
    relatedCommunities?: Array<{ id: string; name: string }>;
    _count?: { registrations?: number };
  };
  type?: "INFORMATIONAL" | "INTERACTIVE";
  showPreview?: boolean;
}

export function EventCard({ event, type = "INFORMATIONAL", showPreview = true }: EventCardProps) {
  const eventDate = new Date(event.startDate);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString("id-ID", { month: "short" }).toUpperCase();
  const weekday = eventDate.toLocaleString("id-ID", { weekday: "short" }).toUpperCase();
  const attendeeCount = event._count?.registrations ?? 0;
  const [isHovering, setIsHovering] = useState(false);
  
  // Tentukan tipe event jika tidak ditentukan
  const eventType = type || (event.quota || event.fee ? "INTERACTIVE" : "INFORMATIONAL");

  // Format harga jika ada fee
  const formatPrice = (fee: string | null | undefined) => {
    if (!fee || fee === "Gratis") return "Gratis";
    const price = fee.replace(/[^\d]/g, "");
    return price ? `Rp ${parseInt(price).toLocaleString("id-ID")}` : "Gratis";
  };

  // Preview hover content
  const PreviewContent = () => (
    <div className="absolute inset-x-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-xl transition-all duration-300">
      <div className="mb-3">
        <h4 className="font-semibold text-gray-900 mb-2">Quick Preview</h4>
        <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">Waktu:</span>
          <div className="font-medium">{event.startTime || "TBA"}</div>
        </div>
        <div>
          <span className="text-gray-500">Kuota:</span>
          <div className="font-medium">
            {event.quota ? `${attendeeCount}/${event.quota}` : "Unlimited"}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Biaya:</span>
          <div className="font-medium text-[#7960D7]">{formatPrice(event.fee)}</div>
        </div>
        <div>
          <span className="text-gray-500">Status:</span>
          <div className="font-medium">
            {event.quota && attendeeCount >= event.quota ? "Penuh" : "Tersedia"}
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link 
          href={`/event/${event.id}`}
          className="block text-center text-sm font-medium text-[#7960D7] hover:text-[#6950c7]"
        >
          Lihat detail lengkap →
        </Link>
      </div>
    </div>
  );

  // Card untuk INTERACTIVE events
  if (eventType === "INTERACTIVE") {
    return (
      <div 
        className="relative" 
        onMouseEnter={() => showPreview && setIsHovering(true)}
        onMouseLeave={() => showPreview && setIsHovering(false)}
      >
        <Link href={`/event/${event.id}`} className="group block">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Header dengan tanggal dan badge */}
            <div className="relative p-4">
              <div className="absolute left-4 top-4">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-[#7960D7] shadow-md">
                  <span className="text-xl font-bold text-white">{day}</span>
                  <span className="text-xs font-medium text-purple-100">{month}</span>
                </div>
              </div>
              
              <div className="pl-20">
                <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-[#7960D7]">
                  {event.name}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#7960D7]/10 px-3 py-1 text-xs font-medium text-[#7960D7]">
                    Interactive
                  </span>
                  {event.fee && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      {formatPrice(event.fee)}
                    </span>
                  )}
                  {event.category && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {event.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick info bar */}
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">{event.startTime || "TBA"}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-gray-700 truncate max-w-[120px]">
                    {event.venue || event.area?.replaceAll("_", " ") || "Online"}
                  </span>
                </div>
              </div>
            </div>

            {/* Participants info */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="h-6 w-6 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="h-6 w-6 rounded-full bg-gray-500 border-2 border-white"></div>
                  </div>
                  <span className="text-sm text-gray-600">{attendeeCount} peserta</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {event.quota ? `${((attendeeCount / event.quota) * 100).toFixed(0)}% terisi` : "Tersedia"}
                </div>
              </div>
              
              {/* Progress bar */}
              {event.quota && (
                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${Math.min((attendeeCount / event.quota) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Action button */}
            <div className="border-t border-gray-100 p-3">
              <button className="w-full rounded-lg bg-[#7960D7] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#6950c7] hover:shadow-md">
                Lihat Detail
              </button>
            </div>
          </div>
        </Link>

        {/* Hover Preview */}
        {showPreview && isHovering && <PreviewContent />}
      </div>
    );
  }

  // Card untuk INFORMATIONAL events (lebih clean)
  return (
    <div 
      className="relative"
      onMouseEnter={() => showPreview && setIsHovering(true)}
      onMouseLeave={() => showPreview && setIsHovering(false)}
    >
      <Link href={`/event/${event.id}`} className="group block">
        <div className="rounded-xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:shadow-lg hover:border-[#7960D7]/20 hover:-translate-y-0.5">
          <div className="flex gap-4">
            {/* Date circle */}
            <div className="flex-shrink-0">
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#7960D7]">
                <span className="text-lg font-bold text-white">{day}</span>
                <span className="text-[10px] text-purple-100">{month}</span>
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-[#7960D7]">
                  {event.name}
                </h3>
                <span className="flex-shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  Info
                </span>
              </div>
              
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">{event.description}</p>
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{event.startTime || "Waktu TBA"}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{event.venue || event.area?.replaceAll("_", " ") || "Online"}</span>
                </div>
                
                <div className="ml-auto flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0h-6m0 0V8a3 3 0 016 0v8z" />
                  </svg>
                  <span>{attendeeCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Hover Preview untuk informational juga */}
      {showPreview && isHovering && <PreviewContent />}
    </div>
  );
}
