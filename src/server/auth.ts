import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AccountStatus = "GUEST" | "INCOMPLETE" | "VERIFIED";

export interface AccountContext {
  status: AccountStatus;
  userId: string | null;
  isAdmin: boolean;
  isOrganizer: (communityId: string) => Promise<boolean>;
}

/**
 * Get the current user's account status and context.
 * Must be called from Server Components or Route Handlers.
 */
export async function getAccountContext(): Promise<AccountContext> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "GUEST",
      userId: null,
      isAdmin: false,
      isOrganizer: async () => false,
    };
  }

  const userId = session.user.id;
  const isAdmin = session.user.isAdmin;

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  // Operator/organizer is not a stored role: it is what a user becomes once
  // their profile is complete (verified phone + domicile + address).
  const isComplete = !!(profile?.phoneVerifiedAt && profile.domicile && profile.address);

  return {
    status: isComplete ? "VERIFIED" : "INCOMPLETE",
    userId,
    isAdmin,
    isOrganizer: async (communityId: string) => {
      const organizer = await prisma.communityOrganizer.findUnique({
        where: {
          communityId_userId: { communityId, userId },
        },
      });
      return !!organizer;
    },
  };
}

/**
 * Require user to be logged in. Throws 401 if not.
 */
export async function requireUser() {
  const ctx = await getAccountContext();
  if (ctx.status === "GUEST") {
    throw new Error("UNAUTHORIZED");
  }
  return ctx;
}

/**
 * Require user to have verified profile. Throws 403 if not.
 * Admin is exempt: the profile gate applies to regular users only.
 */
export async function requireVerified() {
  const ctx = await requireUser();
  if (ctx.status !== "VERIFIED" && !ctx.isAdmin) {
    throw new Error("PROFILE_NOT_VERIFIED");
  }
  return ctx;
}

/**
 * Require user to be admin. Throws 403 if not.
 */
export async function requireAdmin() {
  const ctx = await requireUser();
  if (!ctx.isAdmin) {
    throw new Error("ADMIN_REQUIRED");
  }
  return ctx;
}

/**
 * Require user to be organizer of the specified community. Throws 403 if not.
 */
export async function requireOrganizer(communityId: string) {
  const ctx = await requireUser();
  const isOrganizer = await ctx.isOrganizer(communityId);
  if (!isOrganizer && !ctx.isAdmin) {
    throw new Error("ORGANIZER_REQUIRED");
  }
  return ctx;
}
