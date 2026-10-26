"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();

      if (!data?.user) {
        router.push("/login");
        return;
      }

      setSession(data);
      setLoading(false);
    };

    getSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7960D7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/landing" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Link href="/komunitas" className="text-gray-600 hover:text-gray-900">
              Community
            </Link>
            <Link href="/event" className="text-gray-600 hover:text-gray-900">
              Event
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/profile" className="w-10 h-10 bg-[#7960D7] rounded-full flex items-center justify-center text-white font-bold hover:bg-[#6950c7] transition-colors">
              {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="border-b border-gray-200 pb-8 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-[#7960D7] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{session?.user?.name || 'User'}</h2>
                <p className="text-gray-600">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Account Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Email Address</p>
                  <p className="text-sm text-gray-600">{session?.user?.email}</p>
                </div>
                <button className="px-4 py-2 text-[#7960D7] hover:bg-[#7960D7] hover:bg-opacity-10 rounded-lg font-medium transition-colors text-sm">
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">Change your password</p>
                </div>
                <button className="px-4 py-2 text-[#7960D7] hover:bg-[#7960D7] hover:bg-opacity-10 rounded-lg font-medium transition-colors text-sm">
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Session</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Log out from all devices</p>
                <p className="text-sm text-gray-600">You will be signed out from Togather</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>

        {/* Back to Discovery */}
        <div className="mt-6 text-center">
          <Link href="/discovery" className="inline-flex items-center gap-2 text-[#7960D7] hover:text-[#6950c7] font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Discovery
          </Link>
        </div>
      </main>
    </div>
  );
}
