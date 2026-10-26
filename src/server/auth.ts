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

  // Check profile completeness
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  const isComplete =
    profile &&
    profile.name &&
    profile.phone &&
    profile.domicile &&
    profile.interests.length > 0 &&
    profile.bio;

  const status: AccountStatus =
    isComplete && profile.phoneVerifiedAt ? "VERIFIED" : "INCOMPLETE";

  return {
    status,
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
    throw new Error("Unauthorized");
  }
  return ctx;
}

/**
 * Require user to have verified profile. Throws 403 if not.
 */
export async function requireVerified() {
  const ctx = await requireUser();
  if (ctx.status !== "VERIFIED") {
    throw new Error("Profile not verified");
  }
  return ctx;
}

/**
 * Require user to be admin. Throws 403 if not.
 */
export async function requireAdmin() {
  const ctx = await requireUser();
  if (!ctx.isAdmin) {
    throw new Error("Admin access required");
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
    throw new Error("Organizer access required");
  }
  return ctx;
}
