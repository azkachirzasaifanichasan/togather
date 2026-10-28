import { NextRequest, NextResponse } from "next/server";
import { getAccountContext } from "@/server/auth";
import {
  getJoinRequestCommunityId,
  reviewJoinRequest,
} from "@/server/membership";
import { errorResponse } from "@/lib/api-error";
import { z } from "zod";

const bodySchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAccountContext();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: requestId } = await params;

    const body = await request.json();
    const { action } = bodySchema.parse(body);

    // Resolve the community the request belongs to, then check that the caller
    // is an organizer of THAT community (or an admin). The service
    // repeats the check, but the route must not trust the path parameter.
    const communityId = await getJoinRequestCommunityId(requestId);
    if (!communityId) {
      throw new Error("NOT_FOUND");
    }

    const isOrganizer = await ctx.isOrganizer(communityId);
    if (!isOrganizer && !ctx.isAdmin) {
      throw new Error("ORGANIZER_REQUIRED");
    }

    const result = await reviewJoinRequest(
      requestId,
      action,
      ctx.userId,
      ctx.isAdmin
    );

    return NextResponse.json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
