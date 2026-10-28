import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import { getPendingSubmissions } from "@/server/admin";
import { errorResponse } from "@/lib/api-error";
import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const raw = request.nextUrl.searchParams.get("status");
    const { status } = querySchema.parse({
      status: raw && raw.trim() !== "" ? raw.trim() : undefined,
    });

    if (status && status !== "PENDING") {
      // Only pending submissions are listed by this endpoint.
      return NextResponse.json({ submissions: [] });
    }

    const submissions = await getPendingSubmissions();

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        id: s.id,
        communityId: s.communityId,
        userId: s.userId,
        status: s.status,
        submittedAt: s.submittedAt,
        reviewedAt: s.reviewedAt,
        reviewedBy: s.reviewedBy,
        rejectionReason: s.rejectionReason,
        community: {
          id: s.community.id,
          name: s.community.name,
          description: s.community.description,
          type: s.community.type,
          accessType: s.community.accessType,
          categories: s.community.categories,
          area: s.community.location?.area ?? null,
          addressText: s.community.location?.addressText ?? null,
        },
        submitter: {
          id: s.submitter.id,
          email: s.submitter.email,
          name: s.submitter.profile?.name ?? null,
          phone: s.submitter.profile?.phone ?? null,
        },
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
