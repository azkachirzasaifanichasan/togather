import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import { getAllCommunitiesForAdmin } from "@/server/admin";
import { errorResponse } from "@/lib/api-error";

/**
 * List every community (any submission status) for the admin manager.
 */
export async function GET() {
  try {
    await requireAdmin();

    const communities = await getAllCommunitiesForAdmin();

    return NextResponse.json({
      communities: communities.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        type: c.type,
        accessType: c.accessType,
        categories: c.categories,
        area: c.location?.area ?? null,
        addressText: c.location?.addressText ?? null,
        createdAt: c.createdAt,
        memberCount: c._count.members,
        organizerCount: c._count.organizers,
        eventCount: c._count.events,
        submission: c.submission
          ? {
              id: c.submission.id,
              status: c.submission.status,
              submittedAt: c.submission.submittedAt,
              rejectionReason: c.submission.rejectionReason,
            }
          : null,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
