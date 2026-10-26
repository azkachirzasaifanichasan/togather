import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { UpdateProfileInput } from "@/lib/validations";

/**
 * Create a new user account.
 */
export async function createUser(email: string, password: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: {
        create: {},
      },
    },
    include: {
      profile: true,
    },
  });

  return user;
}

/**
 * Update user profile.
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput
) {
  return await prisma.userProfile.update({
    where: { userId },
    data: {
      name: data.name,
      phone: data.phone,
      domicile: data.domicile,
      interests: data.interests,
      bio: data.bio,
    },
  });
}

/**
 * Simulate phone activation (demo only).
 * In production, this would send WhatsApp OTP.
 */
export async function simulatePhoneActivation(
  userId: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile || !profile.phone) {
    return { success: false, message: "Phone number not set" };
  }

  // In demo, any 6-digit code works (clearly documented limitation)
  if (code.length === 6 && /^\d+$/.test(code)) {
    await prisma.userProfile.update({
      where: { userId },
      data: {
        phoneVerifiedAt: new Date(),
      },
    });
    return { success: true, message: "Phone activated successfully" };
  }

  return { success: false, message: "Invalid activation code" };
}

/**
 * Generate a simulated activation code for demo (server-side only).
 * In production, this would be sent via WhatsApp.
 */
export async function generateSimulatedActivationCode(
  userId: string
): Promise<string> {
  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Log for demo purposes only (NOT FOR PRODUCTION)
  console.log(
    `[DEMO ONLY] Activation code for user ${userId}: ${code}`
  );

  return code;
}

/**
 * Get user with profile.
 */
export async function getUserWithProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });
}
