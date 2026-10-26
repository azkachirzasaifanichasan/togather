import { prisma } from "@/lib/prisma";

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

  if (!submission || submission.status !== "PENDING") {
    throw new Error("Submission not found or already reviewed");
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

    // Make submitter the first organizer
    await tx.communityOrganizer.create({
      data: {
        communityId: submission.communityId,
        userId: submission.userId,
      },
    });

    // Also add submitter as first member
    await tx.communityMembership.create({
      data: {
        communityId: submission.communityId,
        userId: submission.userId,
      },
    });

    return { status: "approved" as const };
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

  if (!submission || submission.status !== "PENDING") {
    throw new Error("Submission not found or already reviewed");
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
    throw new Error("Registration not found");
  }

  // Upsert attendance record
  return await prisma.eventAttendance.upsert({
    where: { registrationId },
    create: {
      registrationId,
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
  metadata?: any
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
