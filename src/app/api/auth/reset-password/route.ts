import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithCode } from "@/server/auth-verification";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const resetPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  code: z.string().length(6, "Kode verifikasi harus 6 digit"),
  newPassword: z.string().min(8, "Password baru harus minimal 8 karakter"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Rate limit: max 10 attempts per 15 minutes per IP
    const rl = rateLimit(`reset-password:ip:${ip}`, 10, 15 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan reset kata sandi. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, code, newPassword } = resetPasswordSchema.parse(body);

    const result = await resetPasswordWithCode({
      email,
      code,
      newPassword,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data permintaan tidak valid", details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Gagal memperbarui kata sandi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

