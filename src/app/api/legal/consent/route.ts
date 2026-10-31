import { NextRequest, NextResponse } from "next/server";
import { getAccountContext } from "@/server/auth";
import { recordTermsConsent, CURRENT_TERMS_VERSION } from "@/server/auth-verification";
import { errorResponse } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAccountContext();
    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await request.json().catch(() => ({}));
    const version = typeof body.version === "string" ? body.version : CURRENT_TERMS_VERSION;

    await recordTermsConsent(ctx.userId, version);

    return NextResponse.json({
      success: true,
      message: "Persetujuan ketentuan layanan berhasil dicatat.",
      version,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

