import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccountContext } from "@/server/auth";
import { errorResponse } from "@/lib/api-error";

/**
 * Current account summary.
 *
 * Two consumers exist, so the payload serves both:
 * - the header/account dropdown (`AccountMenu`, discovery sidebar) reads
 *   `user.name` / `user.avatarUrl` and needs fresh values, because the JWT only
 *   carries what was true at login time;
 * - the account/profile flows read `status`, `isComplete` and `profile`, which
 *   drive the `GUEST -> INCOMPLETE -> VERIFIED` progression.
 *
 * Errors go through `errorResponse` so the body matches the rest of the API.
 */
export async function GET() {
  try {
    const session = await auth();

    // Fresh account data for the header dropdown.
    if (!session?.user?.id) {
      // Use the shared error envelope: every non-2xx response in this API
      // returns `{ error: { code, message } }` (docs/API_CONTRACT.md §2).
      throw new Error("UNAUTHORIZED");
    }

    const [ctx, profile] = await Promise.all([
      getAccountContext(),
      prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
    ]);

    const isComplete = ctx.status === "VERIFIED";

    return NextResponse.json({
      // Shape used by AccountMenu / discovery sidebar.
      user: {
        name: profile?.name || session.user.email || "User",
        email: session.user.email,
        avatarUrl: profile?.avatarUrl ?? null,
        isAdmin: session.user.isAdmin ?? false,
      },
      // Shape used by the account/profile flows.
      status: ctx.status,
      userId: ctx.userId,
      isAdmin: ctx.isAdmin,
      isComplete,
      profile: profile
        ? {
            name: profile.name,
            phone: profile.phone,
            phoneVerifiedAt: profile.phoneVerifiedAt,
            domicile: profile.domicile,
            address: profile.address,
            avatarUrl: profile.avatarUrl,
            interests: profile.interests,
            bio: profile.bio,
          }
        : null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
