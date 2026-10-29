import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default async function NotificationsPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Notifikasi</h1>
          <p className="mt-2 text-gray-600">
            Update aktivitas komunitas dan event yang kamu ikuti
          </p>
        </div>

        {/* Placeholder content */}
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7960D7]/10">
            <svg className="h-8 w-8 text-[#7960D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.03 2.03 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Notifikasi Segera Hadir</h2>
          <p className="mx-auto mb-6 max-w-md text-gray-600">
            Fitur notifikasi aktivitas sedang dalam pengembangan dan akan tersedia di fase berikutnya.
          </p>
          <Link
            href="/discovery"
            className="inline-block rounded-lg bg-[#7960D7] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#6950c7]"
          >
            Kembali ke Discovery
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
