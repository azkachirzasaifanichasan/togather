import { prisma } from "@/lib/prisma";

/**
 * Join a public community or request to join a private community.
 */
export async function joinCommunity(userId: string, communityId: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      submission: true,
    },
  });

  if (!community || community.submission?.status !== "APPROVED") {
    throw new Error("Community not found");
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
 * Last organizer cannot leave.
 */
export async function leaveCommunity(userId: string, communityId: string) {
  // Check if user is an organizer
  const organizer = await prisma.communityOrganizer.findUnique({
    where: {
      communityId_userId: { communityId, userId },
    },
  });

  if (organizer) {
    // Check if this is the last organizer
    const organizerCount = await prisma.communityOrganizer.count({
      where: { communityId },
    });

    if (organizerCount === 1) {
      throw new Error("Last organizer cannot leave the community");
    }
  }

  // Delete membership
  await prisma.communityMembership.delete({
    where: {
      communityId_userId: { communityId, userId },
    },
  });

  return { status: "left" as const };
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
 * Review a join request (approve/reject).
 * Only organizers of the community or admins can review.
 */
export async function reviewJoinRequest(
  requestId: string,
  action: "APPROVE" | "REJECT",
  reviewerId: string
) {
  const request = await prisma.communityJoinRequest.findUnique({
    where: { id: requestId },
    include: {
      community: true,
    },
  });

  if (!request || request.status !== "PENDING") {
    throw new Error("Request not found or already reviewed");
  }

  return await prisma.$transaction(async (tx) => {
    // Update request status
    await tx.communityJoinRequest.update({
      where: { id: requestId },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      },
    });

    // If approved, create membership
    if (action === "APPROVE") {
      await tx.communityMembership.create({
        data: {
          communityId: request.communityId,
          userId: request.userId,
        },
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
