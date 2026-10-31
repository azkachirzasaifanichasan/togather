import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { VerificationCodeType } from "@prisma/client";
import {
  createAndSendVerificationCode,
  verifyVerificationCode,
  checkAccountLockout,
  recordFailedLogin,
  recordSuccessfulLogin,
  resetPasswordWithCode,
  normalizeEmail,
} from "@/server/auth-verification";
import bcrypt from "bcryptjs";

describe("Auth & Verification End-to-End Flow", () => {
  const testEmail = "backend-test-user@example.com";
  let createdUserId = "";

  beforeAll(async () => {
    // Clean up test records
    await prisma.verificationCode.deleteMany({
      where: { email: testEmail },
    });
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });

    // Create a test user
    const passwordHash = await bcrypt.hash("OldPassword123", 10);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        profile: {
          create: { name: "Backend Tester" },
        },
      },
    });
    createdUserId = user.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.verificationCode.deleteMany({
      where: { email: testEmail },
    });
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await prisma.$disconnect();
  });

  it("sends an email verification code and records it in database", async () => {
    const result = await createAndSendVerificationCode({
      email: testEmail,
      type: VerificationCodeType.EMAIL_VERIFICATION,
      userId: createdUserId,
    });

    expect(result.success).toBe(true);
    expect(typeof result.simulated).toBe("boolean");

    const record = await prisma.verificationCode.findFirst({
      where: { email: testEmail, type: VerificationCodeType.EMAIL_VERIFICATION },
      orderBy: { createdAt: "desc" },
    });

    expect(record).toBeDefined();
    expect(record?.code).toHaveLength(6);
    expect(record?.usedAt).toBeNull();
  });

  it("verifies the email code and marks user email as verified", async () => {
    const record = await prisma.verificationCode.findFirst({
      where: { email: testEmail, type: VerificationCodeType.EMAIL_VERIFICATION, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    expect(record).not.toBeNull();

    const verification = await verifyVerificationCode({
      email: testEmail,
      code: record!.code,
      type: VerificationCodeType.EMAIL_VERIFICATION,
    });

    expect(verification.valid).toBe(true);

    // Verify user record has emailVerifiedAt set
    const updatedUser = await prisma.user.findUnique({
      where: { id: createdUserId },
    });
    expect(updatedUser?.emailVerifiedAt).not.toBeNull();

    // Verify code cannot be reused
    const secondTry = await verifyVerificationCode({
      email: testEmail,
      code: record!.code,
      type: VerificationCodeType.EMAIL_VERIFICATION,
    });
    expect(secondTry.valid).toBe(false);
  });

  it("handles brute-force lockout and unlocking", async () => {
    // Initially not locked
    const initialLock = await checkAccountLockout(testEmail);
    expect(initialLock.locked).toBe(false);

    // Fail 4 times: should remain unlocked
    for (let i = 0; i < 4; i++) {
      const res = await recordFailedLogin(testEmail);
      expect(res.locked).toBe(false);
    }

    // 5th failure: locks account
    const fifth = await recordFailedLogin(testEmail);
    expect(fifth.locked).toBe(true);

    const lockedCheck = await checkAccountLockout(testEmail);
    expect(lockedCheck.locked).toBe(true);
    expect(lockedCheck.remainingMinutes).toBeGreaterThan(0);

    // Successful login resets counter
    await recordSuccessfulLogin(createdUserId);
    const resetCheck = await checkAccountLockout(testEmail);
    expect(resetCheck.locked).toBe(false);
  });

  it("supports password reset flow with verification code and invalidates sessions", async () => {
    // Generate reset code
    await createAndSendVerificationCode({
      email: testEmail,
      type: VerificationCodeType.PASSWORD_RESET,
      userId: createdUserId,
    });

    const resetCodeRecord = await prisma.verificationCode.findFirst({
      where: { email: testEmail, type: VerificationCodeType.PASSWORD_RESET, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    expect(resetCodeRecord).not.toBeNull();

    const initialUser = await prisma.user.findUnique({
      where: { id: createdUserId },
    });
    const initialTokenVersion = initialUser?.tokenVersion ?? 0;

    // Reset password with code
    const resetResult = await resetPasswordWithCode({
      email: testEmail,
      code: resetCodeRecord!.code,
      newPassword: "NewSecretPassword2026!",
    });

    expect(resetResult.success).toBe(true);

    const refreshedUser = await prisma.user.findUnique({
      where: { id: createdUserId },
    });

    // Check token version incremented (invalidating old sessions)
    expect(refreshedUser?.tokenVersion).toBe(initialTokenVersion + 1);

    // Check new password hashes match
    const isNewPasswordValid = await bcrypt.compare(
      "NewSecretPassword2026!",
      refreshedUser!.passwordHash
    );
    expect(isNewPasswordValid).toBe(true);
  }, 20000);
});

