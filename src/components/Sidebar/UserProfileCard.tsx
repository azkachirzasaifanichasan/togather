"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export function UserProfileCard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data);
      setLoading(false);
    };

    getSession();
  }, []);

  if (loading) {
    return null;
  }

  if (!session?.user) {
    // Guest state - show placeholder with login button
    return (
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-medium text-[#1F2937]">Guest</span>
        </div>
        <button
          onClick={() => (window.location.href = "/login")}
          className="w-full px-4 py-2 text-sm bg-[#7960D7] hover:bg-[#6950c7] text-white rounded-lg font-medium transition-colors"
        >
          Log in
        </button>
      </div>
    );
  }

  // Get user initials
  const name = session.user.name || session.user.email || "User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-[#7960D7] rounded-full flex items-center justify-center text-white font-bold">
              {initial}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-[#1F2937]">{name}</span>
            <span className="text-xs text-[#6B7280]">
              {(session.user as any).role || "Member"}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/landing" })}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Log out"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
