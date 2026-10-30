import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { InterestCategory } from "@prisma/client";
import type { UpdateCommunityInput } from "@/lib/validations";

/**
 * Cheap count for the sidebar bubble: how many submissions wait for review.
 */
export async function getAdminPendingCount() {
  return await prisma.communitySubmission.count({ where: { status: "PENDING" } });
}

/**
 * Numbers for the admin dashboard.
 *
 * The community table is fetched once and tallied in memory: the admin dataset
 * is small, and `categories` is a scalar list that Prisma's `groupBy` cannot
 * aggregate anyway.
 */
export async function getAdminOverview() {
  const [communities, memberCount, eventCount, pendingCount, recent] =
    await Promise.all([
      prisma.community.findMany({
        select: { categories: true, submission: { select: { status: true } } },
      }),
      prisma.communityMembership.count(),
      prisma.event.count(),
      getAdminPendingCount(),
      prisma.community.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
          submission: { select: { status: true } },
        },
      }),
    ]);

  const tally = new Map<InterestCategory, number>();
  for (const community of communities) {
    for (const category of community.categories) {
      tally.set(category, (tally.get(category) ?? 0) + 1);
    }
  }

  const byStatus = {
    APPROVED: 0,
    PENDING: 0,
    REJECTED: 0,
    NONE: 0,
  };
  for (const community of communities) {
    const status = community.submission?.status;
    if (status) byStatus[status] += 1;
    else byStatus.NONE += 1;
  }

  return {
    total: communities.length,
    byStatus,
    pendingCount,
    memberCount,
    eventCount,
    topCategories: [...tally.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, count]) => ({ category, count })),
    recent,
  };
}

/**
 * Get every community for the admin manager — approved, pending and rejected.
 */
export async function getAllCommunitiesForAdmin() {
  return await prisma.community.findMany({
    include: {
      location: true,
      submission: {
        select: {
          id: true,
          status: true,
          submittedAt: true,
          rejectionReason: true,
        },
      },
      _count: { select: { members: true, organizers: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Edit a community as admin. Location fields live on a separate row, so they
 * are written together with the community in one transaction.
 */
export async function updateCommunityAsAdmin(
  communityId: string,
  data: UpdateCommunityInput
) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { id: true, type: true },
  });

  if (!community) {
    throw new Error("COMMUNITY_NOT_FOUND");
  }

  const type = data.type ?? community.type;

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.community.update({
      where: { id: communityId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.accessType !== undefined && { accessType: data.accessType }),
        ...(data.categories !== undefined && { categories: data.categories }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.bannerUrl !== undefined && { bannerUrl: data.bannerUrl }),
      },
    });

    // Online communities have no area/address; offline ones keep whatever the
    // admin sends (unchanged fields stay untouched).
    await tx.communityLocation.upsert({
      where: { communityId },
      create: {
        communityId,
        isOnline: type === "ONLINE",
        area: type === "OFFLINE" ? data.area ?? null : null,
        addressText: type === "OFFLINE" ? data.addressText ?? null : null,
      },
      update: {
        isOnline: type === "ONLINE",
        ...(type === "ONLINE"
          ? { area: null, addressText: null }
          : {
              ...(data.area !== undefined && { area: data.area }),
              ...(data.addressText !== undefined && {
                addressText: data.addressText,
              }),
            }),
      },
    });

    return updated;
  });
}

/**
 * Get one community with everything the admin edit form needs.
 */
export async function getCommunityForAdmin(communityId: string) {
  return await prisma.community.findUnique({
    where: { id: communityId },
    include: { location: true },
  });
}

/**
 * Hard-delete a community. Child rows (location, organizers, members, join
 * requests, submission, event links) cascade; the events themselves survive.
 */
export async function deleteCommunityAsAdmin(communityId: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { id: true },
  });

  if (!community) {
    throw new Error("COMMUNITY_NOT_FOUND");
  }

  await prisma.community.delete({ where: { id: communityId } });

  return { deleted: true as const };
}

/**
 * Get pending community submissions for admin approval.
 */
export async function getPendingSubmissions() {
  return await prisma.communitySubmission.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      community: {
        include: {
          location: true,
          _count: { select: { members: true } },
        },
      },
      submitter: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });
}

/**
 * Approve a community submission.
 * Makes the submitter the first organizer of the community.
 */
export async function approveCommunitySubmission(
  submissionId: string,
  reviewerId: string
) {
  const submission = await prisma.communitySubmission.findUnique({
    where: { id: submissionId },
    include: {
      community: true,
    },
  });

  if (!submission) {
    throw new Error("NOT_FOUND");
  }

  if (submission.status !== "PENDING") {
    throw new Error("CONFLICT");
  }

  return await prisma.$transaction(async (tx) => {
    // Update submission status
    await tx.communitySubmission.update({
      where: { id: submissionId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      },
    });

    // Make submitter the first organizer (idempotent — the row may already exist)
    await tx.communityOrganizer.upsert({
      where: {
        communityId_userId: {
          communityId: submission.communityId,
          userId: submission.userId,
        },
      },
      create: {
        communityId: submission.communityId,
        userId: submission.userId,
      },
      update: {},
    });

    // Also add submitter as first member (idempotent)
    await tx.communityMembership.upsert({
      where: {
        communityId_userId: {
          communityId: submission.communityId,
          userId: submission.userId,
        },
      },
      create: {
        communityId: submission.communityId,
        userId: submission.userId,
      },
      update: {},
    });

    return { status: "approved" as const, communityId: submission.communityId };
  });
}

/**
 * Reject a community submission.
 */
export async function rejectCommunitySubmission(
  submissionId: string,
  reviewerId: string,
  rejectionReason: string
) {
  const submission = await prisma.communitySubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error("NOT_FOUND");
  }

  if (submission.status !== "PENDING") {
    throw new Error("CONFLICT");
  }

  await prisma.communitySubmission.update({
    where: { id: submissionId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      rejectionReason,
    },
  });

  return { status: "rejected" as const };
}

/**
 * Get all events for admin management.
 */
export async function getAllEventsForAdmin() {
  return await prisma.event.findMany({
    include: {
      relatedCommunities: {
        include: {
          community: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      registrations: {
        where: {
          cancelledAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  name: true,
                },
              },
            },
          },
          attendance: true,
        },
        orderBy: {
          registeredAt: "asc",
        },
      },
      _count: {
        select: {
          registrations: {
            where: {
              cancelledAt: null,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Mark attendance for an event registration (admin only).
 */
export async function markAttendance(
  registrationId: string,
  attended: boolean,
  markedBy: string
) {
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    throw new Error("NOT_FOUND");
  }

  // Upsert attendance record
  return await prisma.eventAttendance.upsert({
    where: { registrationId },
    create: {
      registrationId,
      eventId: registration.eventId,
      attended,
      markedAt: new Date(),
      markedBy,
    },
    update: {
      attended,
      markedAt: new Date(),
      markedBy,
    },
  });
}

/**
 * Record user activity for future recommendations.
 */
export async function recordActivity(
  userId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: Prisma.InputJsonValue
) {
  await prisma.userActivityHistory.create({
    data: {
      userId,
      action,
      targetType,
      targetId,
      metadata,
    },
  });
}
