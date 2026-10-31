import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  normalizeEmail,
  verifyVerificationCode,
  createAndSendVerificationCode,
  CURRENT_TERMS_VERSION,
} from "@/server/auth-verification";
import { VerificationCodeType } from "@prisma/client";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  verificationCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: max 10 registrations per hour per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`register:ip:${ip}`, 10, 60 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan pendaftaran. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    const email = normalizeEmail(validatedData.email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Verify code if provided
    let isEmailVerified = false;
    if (validatedData.verificationCode) {
      const codeCheck = await verifyVerificationCode({
        email,
        code: validatedData.verificationCode,
        type: VerificationCodeType.EMAIL_VERIFICATION,
      });

      if (!codeCheck.valid) {
        return NextResponse.json(
          { error: codeCheck.message },
          { status: 400 }
        );
      }
      isEmailVerified = true;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user with profile & terms acceptance record
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        isAdmin: false,
        emailVerifiedAt: isEmailVerified ? new Date() : null,
        agreedToTermsAt: new Date(),
        termsVersion: CURRENT_TERMS_VERSION,
        profile: {
          create: {
            name: validatedData.name,
          },
        },
      },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        emailVerifiedAt: true,
        profile: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    });

    // If user registered without pre-verifying code, send verification code to email
    if (!isEmailVerified) {
      try {
        await createAndSendVerificationCode({
          email,
          type: VerificationCodeType.EMAIL_VERIFICATION,
          userId: user.id,
        });
      } catch (err) {
        console.warn("[Register] Failed to automatically send initial OTP:", err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        user,
        message: "Account created successfully",
        emailVerified: isEmailVerified,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    const isDev = process.env.NODE_ENV !== "production";
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Gagal membuat akun. Silakan coba beberapa saat lagi.",
        ...(isDev ? { details } : {}),
      },
      { status: 500 }
    );
  }
}
