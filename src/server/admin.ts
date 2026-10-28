import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
