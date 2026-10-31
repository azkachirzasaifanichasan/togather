import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { VerificationCodeType } from "@prisma/client";
import {
  sendVerificationCodeEmail,
  sendPasswordChangedNotificationEmail,
  EmailTemplateType,
} from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export const CURRENT_TERMS_VERSION = "1.0";
const CODE_EXPIRY_MINUTES = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Normalizes email address for consistent comparison in PostgreSQL.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Generates a cryptographically secure 6-digit random code.
 */
export function generateSixDigitCode(): string {
  return randomInt(100000, 1000000).toString();
}

/**
 * Sends a 6-digit verification code to the target email.
 * Applies rate limiting to prevent email spamming.
 */
export async function createAndSendVerificationCode({
  email,
  type,
  userId,
}: {
  email: string;
  type: VerificationCodeType;
  userId?: string;
}): Promise<{ success: boolean; message: string; simulated?: boolean }> {
  const normalized = normalizeEmail(email);

  // Rate limit: 1 request per 45 seconds per email
  const rlCooldown = rateLimit(`otp:cooldown:${normalized}:${type}`, 1, 45 * 1000);
  if (!rlCooldown.success) {
    const waitSec = Math.ceil(rlCooldown.resetInMs / 1000);
    throw new Error(`Silakan tunggu ${waitSec} detik sebelum meminta kode baru.`);
  }

  // Rate limit: maximum 5 requests per hour per email
  const rlHourly = rateLimit(`otp:hourly:${normalized}:${type}`, 5, 60 * 60 * 1000);
  if (!rlHourly.success) {
    throw new Error("Terlalu banyak permintaan kode. Silakan coba lagi dalam 1 jam.");
  }

  // Invalidate any previous unverified codes for this email and type
  await prisma.verificationCode.updateMany({
    where: {
      email: normalized,
      type,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

  // If userId not provided, try to find existing user with this email
  let targetUserId = userId;
  if (!targetUserId) {
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    });
    if (user) {
      targetUserId = user.id;
    }
  }

  // Save verification record
  await prisma.verificationCode.create({
    data: {
      email: normalized,
      code,
      type,
      expiresAt,
      userId: targetUserId,
    },
  });

  // Dispatch email
  const emailResult = await sendVerificationCodeEmail({
    to: normalized,
    code,
    type: type as unknown as EmailTemplateType,
    expiresInMinutes: CODE_EXPIRY_MINUTES,
  });

  return {
    success: true,
    message: `Kode verifikasi telah dikirim ke ${normalized}.`,
    simulated: emailResult.simulated,
  };
}

/**
 * Validates a verification code.
 */
export async function verifyVerificationCode({
  email,
  code,
  type,
}: {
  email: string;
  code: string;
  type: VerificationCodeType;
}): Promise<{ valid: boolean; message: string; userId?: string }> {
  const normalized = normalizeEmail(email);
  const cleanCode = code.trim();

  const record = await prisma.verificationCode.findFirst({
    where: {
      email: normalized,
      code: cleanCode,
      type,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { valid: false, message: "Kode verifikasi salah atau tidak ditemukan." };
  }

  if (record.usedAt) {
    return { valid: false, message: "Kode verifikasi ini sudah pernah digunakan." };
  }

  if (record.expiresAt < new Date()) {
    return { valid: false, message: "Kode verifikasi telah kedaluwarsa. Silakan minta kode baru." };
  }

  // Mark code as used
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  // If email verification, update user record
  if (type === VerificationCodeType.EMAIL_VERIFICATION) {
    await prisma.user.updateMany({
      where: { email: normalized },
      data: { emailVerifiedAt: new Date() },
    });
  }

  return {
    valid: true,
    message: "Verifikasi berhasil.",
    userId: record.userId || undefined,
  };
}

/**
 * Check if user account is currently locked due to failed login attempts.
 */
export async function checkAccountLockout(email: string): Promise<{
  locked: boolean;
  remainingMinutes?: number;
}> {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { lockedUntil: true },
  });

  if (!user || !user.lockedUntil) {
    return { locked: false };
  }

  const now = new Date();
  if (user.lockedUntil > now) {
    const diffMs = user.lockedUntil.getTime() - now.getTime();
    const remainingMinutes = Math.max(1, Math.ceil(diffMs / (60 * 1000)));
    return { locked: true, remainingMinutes };
  }

  return { locked: false };
}

/**
 * Records a failed login attempt and locks account if threshold exceeded.
 */
export async function recordFailedLogin(email: string): Promise<{
  locked: boolean;
  attemptsLeft: number;
}> {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, failedLoginAttempts: true },
  });

  if (!user) {
    return { locked: false, attemptsLeft: 0 };
  }

  const newAttempts = user.failedLoginAttempts + 1;
  const isLocked = newAttempts >= MAX_FAILED_ATTEMPTS;
  const lockedUntil = isLocked
    ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
    : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: newAttempts,
      ...(isLocked ? { lockedUntil } : {}),
    },
  });

  return {
    locked: isLocked,
    attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts),
  };
}

/**
 * Resets failed login attempts upon successful authentication.
 */
export async function recordSuccessfulLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
}

/**
 * Records user acceptance of terms of service.
 */
export async function recordTermsConsent(
  userId: string,
  version: string = CURRENT_TERMS_VERSION
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      agreedToTermsAt: new Date(),
      termsVersion: version,
    },
  });
}

/**
 * Resets a user's password using a verified PASSWORD_RESET code.
 */
export async function resetPasswordWithCode({
  email,
  code,
  newPassword,
}: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const normalized = normalizeEmail(email);

  if (newPassword.length < 8) {
    throw new Error("Password minimal harus 8 karakter.");
  }

  const verification = await verifyVerificationCode({
    email: normalized,
    code,
    type: VerificationCodeType.PASSWORD_RESET,
  });

  if (!verification.valid) {
    throw new Error(verification.message);
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized },
  });

  if (!user) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password, increment tokenVersion (revoking other active JWTs), reset lock
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      tokenVersion: { increment: 1 },
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // Kirim email notifikasi keamanan secara asinkron
  try {
    await sendPasswordChangedNotificationEmail({
      to: normalized,
      changedAt: new Date(),
    });
  } catch (emailErr) {
    console.warn("[Auth] Gagal mengirim notifikasi email ubah kata sandi:", emailErr);
  }

  return {
    success: true,
    message: "Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru.",
  };
}

