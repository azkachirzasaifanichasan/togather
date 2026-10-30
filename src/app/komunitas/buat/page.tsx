import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAccountContext } from "@/server/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CreateCommunityForm } from "./CreateCommunityForm";

export default async function CreateCommunityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getAccountContext();
  // Admin can do everything; everyone else must be an operator (verified
  // profile) before submitting a community.
  if (!ctx.isAdmin && ctx.status !== "VERIFIED") redirect("/settings/edit-profile");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <Link
          href={ctx.isAdmin ? "/admin/komunitas" : "/komunitas"}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {ctx.isAdmin ? "Kembali ke kelola komunitas" : "Kembali ke Community"}
        </Link>

        <h1 className="mb-1 text-2xl font-bold text-[#1F2937]">Buat komunitas</h1>
        <p className="mb-6 text-sm text-[#6B7280]">
          {ctx.isAdmin
            ? "Sebagai admin, komunitas yang kamu buat langsung tampil tanpa antrean persetujuan."
            : "Komunitas yang kamu buat akan kamu kelola sebagai pengurus."}
        </p>

        <CreateCommunityForm isAdmin={ctx.isAdmin} />
      </div>

      <Footer />
    </div>
  );
}
