import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSavedPosts } from "@/server/posts";
import { SavedPostsClient } from "./SavedPostsClient";

export const metadata = {
  title: "Saved Posts - Togather",
  description: "Daftar postingan yang kamu simpan dari berbagai komunitas.",
};

export default async function SavedSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const posts = await getSavedPosts(session.user.id);

  return <SavedPostsClient initialPosts={posts} />;
}

