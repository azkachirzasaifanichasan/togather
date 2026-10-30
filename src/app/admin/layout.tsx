import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAccountContext } from "@/server/auth";
import { getAdminPendingCount } from "@/server/admin";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// The admin area is per-user and reads the database, so it must never be
// prerendered: `next build` runs without a database in CI/Docker.
export const dynamic = "force-dynamic";

/**
 * Admin-only area. The guard lives here, so every nested page inherits it.
 *
 * The pending count is fetched in the layout so the sidebar badge is correct on
 * every admin screen without each page having to pass it down.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getAccountContext();
  if (!ctx.isAdmin) redirect("/discovery");

  const pendingCount = await getAdminPendingCount();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6 lg:py-8">
        <AdminSidebar pendingCount={pendingCount} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <Footer />
    </div>
  );
}
