import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  // Guest → landing, Login → discovery
  if (!session) {
    redirect("/landing");
  }

  redirect("/discovery");
}
