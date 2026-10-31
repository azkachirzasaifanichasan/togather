import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { VerificationCodeType } from "@prisma/client";
import { createAndSendVerificationCode, normalizeEmail } from "@/server/auth-verification";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const sendOtpSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  type: z
    .enum(["EMAIL_VERIFICATION", "PASSWORD_RESET", "LOGIN_OTP"])
    .default("EMAIL_VERIFICATION"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Rate limit per IP: max 15 requests per 10 minutes
    const rl = rateLimit(`otp:send:ip:${ip}`, 15, 10 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan pengiriman kode. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, type } = sendOtpSchema.parse(body);

    const result = await createAndSendVerificationCode({
      email: normalizeEmail(email),
      type: type as VerificationCodeType,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data permintaan tidak valid", details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Gagal mengirim kode verifikasi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

