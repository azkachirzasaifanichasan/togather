import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  // If not authenticated, redirect to landing page
  if (!session) {
    redirect("/landing");
  }

  // If authenticated, redirect to discovery page
  redirect("/discovery");
}
