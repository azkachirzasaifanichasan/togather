import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { UpdateProfileInput, CompleteProfileInput } from "@/lib/validations";

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
      address: data.address,
      interests: data.interests,
      bio: data.bio,
    },
  });
}

/**
 * Complete the organizer gate: profile only needs phone + domicile + address,
 * but interests/bio/name are left as they were.
 */
export async function completeUserProfile(
  userId: string,
  data: CompleteProfileInput
) {
  return await prisma.userProfile.update({
    where: { userId },
    data: {
      name: data.name,
      phone: data.phone,
      domicile: data.domicile,
      address: data.address,
      // An empty uploader value means "leave the existing photo alone".
      ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
      ...(data.interests ? { interests: data.interests } : {}),
      ...(data.bio !== undefined ? { bio: data.bio || null } : {}),
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

/**
 * Resolve (or create) the Togather user for an external OAuth account.
 *
 * This is the account-linking logic for OAuth sign-in. It runs without a
 * NextAuth database adapter: the `Account` table stores the link between the
 * external provider account and our own `User` row.
 *
 * Rules:
 * - The external account id (`provider` + `providerAccountId`) is the primary
 *   key. If it is already linked, that user is returned.
 * - Otherwise, if a Togather user already exists with the same email, the
 *   external account is linked to that user (so a person can sign in with
 *   either method).
 * - Otherwise a brand new user is created, together with an empty profile so
 *   the account starts in the `INCOMPLETE` state and must be completed.
 */
export async function resolveOAuthUser({
  provider,
  providerAccountId,
  email,
  name,
  tokens,
}: {
  provider: string;
  providerAccountId: string;
  email: string;
  name?: string | null;
  tokens?: {
    access_token?: string | null;
    refresh_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
  };
}) {
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: { provider, providerAccountId },
    },
    include: { user: { include: { profile: true } } },
  });

  if (existingAccount) {
    // Refresh the stored tokens, they may have been rotated.
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: {
        access_token: tokens?.access_token ?? existingAccount.access_token,
        refresh_token: tokens?.refresh_token ?? existingAccount.refresh_token,
        expires_at: tokens?.expires_at ?? existingAccount.expires_at,
        token_type: tokens?.token_type ?? existingAccount.token_type,
        scope: tokens?.scope ?? existingAccount.scope,
        id_token: tokens?.id_token ?? existingAccount.id_token,
      },
    });

    return existingAccount.user;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (existingUser) {
    // Link the external account to the existing user.
    await prisma.account.create({
      data: {
        userId: existingUser.id,
        type: "oauth",
        provider,
        providerAccountId,
        access_token: tokens?.access_token ?? null,
        refresh_token: tokens?.refresh_token ?? null,
        expires_at: tokens?.expires_at ?? null,
        token_type: tokens?.token_type ?? null,
        scope: tokens?.scope ?? null,
        id_token: tokens?.id_token ?? null,
      },
    });

    return existingUser;
  }

  // New user. The password hash is a random value so the account can never be
  // used with the credentials provider — only via the OAuth provider.
  const passwordHash = await hash(randomBytes(32).toString("hex"), 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      isAdmin: false,
      profile: {
        create: {
          name: name ?? null,
        },
      },
      accounts: {
        create: {
          type: "oauth",
          provider,
          providerAccountId,
          access_token: tokens?.access_token ?? null,
          refresh_token: tokens?.refresh_token ?? null,
          expires_at: tokens?.expires_at ?? null,
          token_type: tokens?.token_type ?? null,
          scope: tokens?.scope ?? null,
          id_token: tokens?.id_token ?? null,
        },
      },
    },
    include: { profile: true },
  });

  return user;
}
