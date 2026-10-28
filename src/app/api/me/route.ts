import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Fresh account data for the header dropdown. The JWT only carries what was
// true at login time, so the avatar/name are read here instead.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { name: true, avatarUrl: true },
  });

  return NextResponse.json({
    user: {
      name: profile?.name || session.user.email || "User",
      email: session.user.email,
      avatarUrl: profile?.avatarUrl ?? null,
      isAdmin: session.user.isAdmin ?? false,
    },
  });
}
