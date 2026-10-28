import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import { approveCommunitySubmission } from "@/server/admin";
import { errorResponse } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAdmin();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: submissionId } = await params;

    const result = await approveCommunitySubmission(submissionId, ctx.userId);

    return NextResponse.json({
      success: true,
      status: result.status,
      communityId: result.communityId,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
