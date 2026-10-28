import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import { markAttendance } from "@/server/admin";
import { errorResponse } from "@/lib/api-error";
import { z } from "zod";

const bodySchema = z.object({
  attended: z.boolean(),
});

/**
 * Mark (or unmark) attendance for one event registration. Admin only.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAdmin();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: registrationId } = await params;

    const body = await request.json();
    const { attended } = bodySchema.parse(body);

    const attendance = await markAttendance(
      registrationId,
      attended,
      ctx.userId
    );

    return NextResponse.json({
      success: true,
      registrationId: attendance.registrationId,
      attended: attendance.attended,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
