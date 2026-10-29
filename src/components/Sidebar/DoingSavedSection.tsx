"use client";

import { useState } from "react";
import Link from "next/link";

interface SidebarMembership {
  id: string;
  community?: { name?: string | null; category?: string | null } | null;
}

interface SidebarSavedItem {
  id: string;
  name?: string | null;
}

interface DoingSavedSectionProps {
  memberships?: SidebarMembership[];
  savedItems?: SidebarSavedItem[];
}

export function DoingSavedSection({ memberships = [], savedItems = [] }: DoingSavedSectionProps) {
  const [activeTab, setActiveTab] = useState<"doing" | "saved">("doing");

  const hasDoing = memberships.length > 0;
  const hasSaved = savedItems.length > 0;

  return (
    <div className="bg-[#7960D7] rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("doing")}
            className={`font-semibold pb-1 transition-colors ${
              activeTab === "doing" ? "border-b-2 border-white" : "opacity-70 hover:opacity-100"
            }`}
          >
            Doing
          </button>
          <span className="opacity-50">|</span>
          <button
            onClick={() => setActiveTab("saved")}
            className={`font-semibold pb-1 transition-colors ${
              activeTab === "saved" ? "border-b-2 border-white" : "opacity-70 hover:opacity-100"
            }`}
          >
            Saved
          </button>
        </div>
        <button className="text-sm hover:underline">See all</button>
      </div>

      {activeTab === "doing" && !hasDoing && (
        <div className="text-center py-6">
          <p className="text-white/90 mb-4">Looks like you&apos;re free</p>
          <Link
            href="/event"
            className="inline-block bg-[#1F2937] hover:bg-[#111827] text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Find events
          </Link>
        </div>
      )}

      {activeTab === "doing" && hasDoing && (
        <div className="space-y-3">
          {memberships.slice(0, 3).map((membership) => (
            <div key={membership.id} className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer">
              <h4 className="font-medium text-sm">{membership.community?.name}</h4>
              <p className="text-xs text-white/70 mt-1">{membership.community?.category}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "saved" && !hasSaved && (
        <div className="text-center py-6">
          <p className="text-white/90 text-sm">No saved items yet</p>
        </div>
      )}

      {activeTab === "saved" && hasSaved && (
        <div className="space-y-3">
          {savedItems.slice(0, 3).map((item) => (
            <div key={item.id} className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer">
              <h4 className="font-medium text-sm">{item.name}</h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
