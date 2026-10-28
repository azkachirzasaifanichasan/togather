import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsNav } from "@/components/SettingsNav";
import { AccountMenu } from "@/components/AccountMenu";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { name: true, avatarUrl: true },
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/discovery" className="text-lg font-bold text-[#7960D7]">
            Togather
          </Link>
          <AccountMenu
            initialUser={{
              name: profile?.name || session.user.email || "User",
              email: session.user.email,
              avatarUrl: profile?.avatarUrl ?? null,
              isAdmin: session.user.isAdmin ?? false,
            }}
          />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        <aside className="md:w-56 flex-shrink-0">
          <h1 className="text-lg font-bold text-[#1F2937] mb-4 px-3">
            Settings
          </h1>
          <SettingsNav />
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
