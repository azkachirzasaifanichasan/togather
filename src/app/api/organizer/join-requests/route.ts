import { NextResponse } from "next/server";
import { getAccountContext } from "@/server/auth";
import {
  getPendingJoinRequests,
  getOrganizedCommunityIds,
} from "@/server/membership";
import { errorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const ctx = await getAccountContext();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    // The caller must actually organize at least one community (admins may
    // act as organizers everywhere).
    const organizedIds = await getOrganizedCommunityIds(ctx.userId);
    if (organizedIds.length === 0 && !ctx.isAdmin) {
      throw new Error("ORGANIZER_REQUIRED");
    }

    const requests = await getPendingJoinRequests(ctx.userId);

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        communityId: r.communityId,
        userId: r.userId,
        status: r.status,
        requestedAt: r.requestedAt,
        reviewedAt: r.reviewedAt,
        reviewedBy: r.reviewedBy,
        community: { id: r.community.id, name: r.community.name },
        user: {
          id: r.user.id,
          email: r.user.email,
          name: r.user.profile?.name ?? null,
          interests: r.user.profile?.interests ?? [],
        },
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
