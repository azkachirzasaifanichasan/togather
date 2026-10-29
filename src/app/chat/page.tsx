import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default async function ChatPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Chat Komunitas</h1>
          <p className="mt-2 text-gray-600">
            Komunikasi langsung dengan anggota komunitas
          </p>
        </div>

        {/* Placeholder content */}
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7960D7]/10">
            <svg className="h-8 w-8 text-[#7960D7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Chat Segera Hadir</h2>
          <p className="mx-auto mb-6 max-w-md text-gray-600">
            Fitur chat komunitas sedang dalam pengembangan dan akan tersedia di fase berikutnya.
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
