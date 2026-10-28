import { NextRequest, NextResponse } from "next/server";
import { getAccountContext } from "@/server/auth";
import { getCommunityMembers } from "@/server/membership";
import { errorResponse } from "@/lib/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAccountContext();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: communityId } = await params;

    // The caller must be an organizer of THIS community (or an admin).
    const isOrganizer = await ctx.isOrganizer(communityId);
    if (!isOrganizer && !ctx.isAdmin) {
      throw new Error("ORGANIZER_REQUIRED");
    }

    const members = await getCommunityMembers(communityId);

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        communityId: m.communityId,
        userId: m.userId,
        joinedAt: m.joinedAt,
        user: {
          id: m.user.id,
          email: m.user.email,
          name: m.user.profile?.name ?? null,
          interests: m.user.profile?.interests ?? [],
        },
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
