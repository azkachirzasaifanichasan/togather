import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { createReportSchema } from "@/lib/validations";
import { reportContent } from "@/server/moderation";

/**
 * File a report against a post or a comment.
 *
 * The pair `(reporterId, targetType, targetId)` is unique, so sending the same
 * report twice only updates its reason.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const body = createReportSchema.parse(await request.json());
    const result = await reportContent(
      session.user.id,
      body.targetType,
      body.targetId,
      body.reason
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
