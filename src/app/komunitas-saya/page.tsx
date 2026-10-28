import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountMenu } from "@/components/AccountMenu";

// Placeholder: the Your groups UI is scheduled for the next pass.
export default async function KomunitasSayaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/discovery" className="text-lg font-bold text-[#7960D7]">
            Togather
          </Link>
          <AccountMenu />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#1F2937]">Your groups</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Halaman ini belum dibuat. Sementara itu, grup yang kamu ikuti tampil di{" "}
          <Link href="/profile" className="text-[#7960D7] font-semibold hover:underline">
            profil
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
