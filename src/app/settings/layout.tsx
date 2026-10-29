import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsNav } from "@/components/SettingsNav";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <Header />

      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 flex flex-col md:flex-row gap-8">
        <aside className="md:w-56 flex-shrink-0">
          <h1 className="text-lg font-bold text-[#1F2937] mb-4 px-3">
            Settings
          </h1>
          <SettingsNav />
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>

      <Footer />
    </div>
  );
}
