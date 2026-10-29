"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

// signOut resolves without throwing when called from a server action, so the
// action itself must navigate. The cookie is already cleared by now.
export async function logout() {
  await signOut({ redirectTo: "/login" });
  redirect("/login");
}
