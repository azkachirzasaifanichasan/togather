import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { VerificationCodeType } from "@prisma/client";
import { verifyVerificationCode, normalizeEmail } from "@/server/auth-verification";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const verifyOtpSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  code: z.string().length(6, "Kode verifikasi harus 6 digit"),
  type: z
    .enum(["EMAIL_VERIFICATION", "PASSWORD_RESET", "LOGIN_OTP"])
    .default("EMAIL_VERIFICATION"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Rate limit per IP: max 20 verify attempts per 10 minutes (prevents brute-forcing codes)
    const rl = rateLimit(`otp:verify:ip:${ip}`, 20, 10 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan verifikasi. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, code, type } = verifyOtpSchema.parse(body);

    const result = await verifyVerificationCode({
      email: normalizeEmail(email),
      code,
      type: type as VerificationCodeType,
    });

    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data permintaan tidak valid", details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Gagal memverifikasi kode";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

