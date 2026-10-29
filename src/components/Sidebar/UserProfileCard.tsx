"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SessionData {
  user?: SessionUser | null;
}

export function UserProfileCard() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setSession(data);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return null;
  }

  if (!session?.user) {
    return (
      <div className="space-y-3 rounded-xl bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 font-bold text-white">
            A
          </div>
          <span className="font-medium text-[#1F2937]">Guest</span>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="w-full rounded-lg bg-[#7960D7] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6950c7]"
        >
          Log in
        </button>
      </div>
    );
  }

  const name = session.user.name || session.user.email || "User";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="space-y-3 rounded-xl bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7960D7] font-bold text-white">
              {initial}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-[#1F2937]">{name}</span>
            <span className="text-xs text-[#6B7280]">Member</span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/landing" })}
          className="rounded-lg p-2 transition-colors hover:bg-gray-200"
          title="Log out"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
