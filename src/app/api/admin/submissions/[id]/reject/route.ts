import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import { rejectCommunitySubmission } from "@/server/admin";
import { errorResponse } from "@/lib/api-error";
import { z } from "zod";

const bodySchema = z.object({
  rejectionReason: z
    .string()
    .min(10, "Alasan penolakan minimal 10 karakter")
    .max(500),
});

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

    const body = await request.json();
    const { rejectionReason } = bodySchema.parse(body);

    const result = await rejectCommunitySubmission(
      submissionId,
      ctx.userId,
      rejectionReason
    );

    return NextResponse.json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
