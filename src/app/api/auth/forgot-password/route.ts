import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { VerificationCodeType } from "@prisma/client";
import { createAndSendVerificationCode, normalizeEmail } from "@/server/auth-verification";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Rate limit: max 5 forgot-password requests per 15 minutes per IP
    const rl = rateLimit(`forgot-password:ip:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan reset kata sandi. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);
    const normalized = normalizeEmail(email);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    });

    if (user) {
      try {
        await createAndSendVerificationCode({
          email: normalized,
          type: VerificationCodeType.PASSWORD_RESET,
          userId: user.id,
        });
      } catch (err) {
        console.warn("[ForgotPassword] Failed to dispatch code:", err);
      }
    }

    // Always return generic message to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, instruksi pemulihan kata sandi telah dikirim.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Format email tidak valid", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Gagal memproses permintaan reset kata sandi" },
      { status: 500 }
    );
  }
}

