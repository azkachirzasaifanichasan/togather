import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Join a public community or request to join a private community.
 *
 * Idempotent:
 * - already a member          -> { status: "already_member" }
 * - already pending request   -> { status: "request_exists" }
 * - public and joined         -> { status: "joined" }
 * - private and requested     -> { status: "request_created" }
 */
export async function joinCommunity(userId: string, communityId: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      submission: true,
    },
  });

  if (!community || community.submission?.status !== "APPROVED") {
    throw new Error("COMMUNITY_NOT_FOUND");
  }

  // Check if already a member
  const existingMembership = await prisma.communityMembership.findUnique({
    where: {
      communityId_userId: { communityId, userId },
    },
  });

  if (existingMembership) {
    return { status: "already_member" as const };
  }

  // Public community: join directly
  if (community.accessType === "PUBLIC") {
    await prisma.communityMembership.create({
      data: {
        communityId,
        userId,
      },
    });
    return { status: "joined" as const };
  }

  // Private community: create join request
  const existingRequest = await prisma.communityJoinRequest.findUnique({
    where: {
      communityId_userId: { communityId, userId },
    },
  });

  if (existingRequest) {
    return {
      status: "request_exists" as const,
      requestStatus: existingRequest.status,
    };
  }

  await prisma.communityJoinRequest.create({
    data: {
      communityId,
      userId,
      status: "PENDING",
    },
  });

  return { status: "request_created" as const };
}

/**
 * Leave a community.
 *
 * - the last organizer cannot leave            -> Error("LAST_ORGANIZER")
 * - organizers leaving with others remaining   -> also drop the organizer row
 * - not a member                               -> { status: "not_member" } (never P2025)
 */
export async function leaveCommunity(userId: string, communityId: string) {
  return await prisma.$transaction(async (tx) => {
    const organizer = await tx.communityOrganizer.findUnique({
      where: {
        communityId_userId: { communityId, userId },
      },
    });

    if (organizer) {
      const organizerCount = await tx.communityOrganizer.count({
        where: { communityId },
      });

      if (organizerCount <= 1) {
        throw new Error("LAST_ORGANIZER");
      }

      // Other organizers remain, so this one may step down.
      await tx.communityOrganizer.delete({
        where: {
          communityId_userId: { communityId, userId },
        },
      });
    }

    const membership = await tx.communityMembership.findUnique({
      where: {
        communityId_userId: { communityId, userId },
      },
    });

    if (!membership) {
      return { status: "not_member" as const };
    }

    await tx.communityMembership.delete({
      where: {
        communityId_userId: { communityId, userId },
      },
    });

    return { status: "left" as const };
  });
}

/**
 * Get the community ids the user organizes.
 * Used to decide whether the caller may act as an organizer at all.
 */
export async function getOrganizedCommunityIds(userId: string) {
  const rows = await prisma.communityOrganizer.findMany({
    where: { userId },
    select: { communityId: true },
  });

  return rows.map((r) => r.communityId);
}

/**
 * Get the community id a join request belongs to.
 * Returns null when the request does not exist.
 */
export async function getJoinRequestCommunityId(
  requestId: string
): Promise<string | null> {
  const request = await prisma.communityJoinRequest.findUnique({
    where: { id: requestId },
    select: { communityId: true },
  });

  return request?.communityId ?? null;
}

/**
 * Get pending join requests for communities organized by user.
 */
export async function getPendingJoinRequests(userId: string) {
  const requests = await prisma.communityJoinRequest.findMany({
    where: {
      status: "PENDING",
      community: {
        organizers: {
          some: { userId },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              interests: true,
            },
          },
        },
      },
      community: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      requestedAt: "desc",
    },
  });

  return requests;
}

/**
 * Check whether `userId` may review requests for `communityId`.
 * Admins may review any community.
 */
export async function canReviewCommunity(
  userId: string,
  communityId: string,
  isAdmin: boolean
): Promise<boolean> {
  if (isAdmin) {
    return true;
  }

  const organizer = await prisma.communityOrganizer.findUnique({
    where: {
      communityId_userId: { communityId, userId },
    },
  });

  return !!organizer;
}

/**
 * Review a join request (approve/reject).
 *
 * The service verifies that `reviewerId` really is an organizer of the
 * request's community, or an admin. The parameter alone is never trusted.
 */
export async function reviewJoinRequest(
  requestId: string,
  action: "APPROVE" | "REJECT",
  reviewerId: string,
  reviewerIsAdmin: boolean
) {
  const request = await prisma.communityJoinRequest.findUnique({
    where: { id: requestId },
    include: {
      community: true,
    },
  });

  if (!request) {
    throw new Error("NOT_FOUND");
  }

  const allowed = await canReviewCommunity(
    reviewerId,
    request.communityId,
    reviewerIsAdmin
  );
  if (!allowed) {
    throw new Error("ORGANIZER_REQUIRED");
  }

  if (request.status !== "PENDING") {
    throw new Error("CONFLICT");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.communityJoinRequest.update({
      where: { id: requestId },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      },
    });

    if (action === "APPROVE") {
      // Idempotent: the user may already be a member.
      await tx.communityMembership.upsert({
        where: {
          communityId_userId: {
            communityId: request.communityId,
            userId: request.userId,
          },
        },
        create: {
          communityId: request.communityId,
          userId: request.userId,
        },
        update: {},
      });
    }

    return { status: action === "APPROVE" ? "approved" : "rejected" };
  });
}

/**
 * Get community members (for organizers).
 */
export async function getCommunityMembers(communityId: string) {
  return await prisma.communityMembership.findMany({
    where: { communityId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              interests: true,
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });
}

export type MembershipClient = Prisma.TransactionClient;
