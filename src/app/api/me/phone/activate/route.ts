import { NextRequest, NextResponse } from "next/server";
import { getAccountContext } from "@/server/auth";
import { simulatePhoneActivation } from "@/server/users";
import { activatePhoneSchema } from "@/lib/validations";
import { errorResponse } from "@/lib/api-error";

/**
 * Simulate a phone activation.
 *
 * This is a DEMO simulation: any 6-digit code is accepted and the phone number
 * is marked verified. In production this would verify a WhatsApp OTP.
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await getAccountContext();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await request.json();
    const { code } = activatePhoneSchema.parse(body);

    const result = await simulatePhoneActivation(ctx.userId, code);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: result.message,
          },
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "VERIFIED",
      message: result.message,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
