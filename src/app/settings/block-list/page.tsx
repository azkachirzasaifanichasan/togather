import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBlockedUsers } from "@/server/moderation";
import { BlockListClient } from "./BlockListClient";

export const metadata = {
  title: "Block List - Togather",
  description: "Daftar pengguna yang kamu blokir di Togather.",
};

export default async function BlockListSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const blockedUsers = await getBlockedUsers(session.user.id);

  return <BlockListClient initialBlockedUsers={blockedUsers} />;
}

