import { prisma } from "@/lib/prisma";
import {
  CreateCommunityInput,
  DiscoveryFilterInput,
} from "@/lib/validations";
import { Prisma } from "@prisma/client";

/**
 * Get communities for discovery with filters.
 * Only returns approved communities.
 */
export async function getDiscoveryCommunities(
  filters: DiscoveryFilterInput = {}
) {
  const where: Prisma.CommunityWhereInput = {
    // Only approved communities (must have approved submission)
    submission: {
      status: "APPROVED",
    },
  };

  // Filter by categories
  if (filters.categories && filters.categories.length > 0) {
    where.categories = {
      hasSome: filters.categories,
    };
  }

  // Filter by type
  if (filters.type) {
    where.type = filters.type;
  }

  // Filter by access type
  if (filters.accessType) {
    where.accessType = filters.accessType;
  }

  // Filter by area
  if (filters.area) {
    where.location = {
      area: filters.area,
    };
  }

  const communities = await prisma.community.findMany({
    where,
    include: {
      location: true,
      _count: {
        select: {
          members: true,
          events: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Distance filtering if coordinates provided
  if (
    filters.distance &&
    filters.userLat !== undefined &&
    filters.userLng !== undefined
  ) {
    // Use raw SQL for PostGIS distance calculation
    const point = `POINT(${filters.userLng} ${filters.userLat})`;
    const distanceInMeters = filters.distance * 1000;

    const communitiesWithDistance = await prisma.$queryRaw<
      Array<{ id: string; distance: number }>
    >`
      SELECT c.id, ST_Distance(cl.coordinates, ST_GeographyFromText(${point})) as distance
      FROM "Community" c
      LEFT JOIN "CommunityLocation" cl ON c.id = cl."communityId"
      WHERE c.id IN (${Prisma.join(communities.map((c) => c.id))})
        AND cl.coordinates IS NOT NULL
        AND ST_DWithin(cl.coordinates, ST_GeographyFromText(${point}), ${distanceInMeters})
      ORDER BY distance ASC
    `;

    const communityIdsWithinDistance = new Set(
      communitiesWithDistance.map((c) => c.id)
    );

    // Filter out communities outside distance, keep online communities
    return communities.filter(
      (c) =>
        c.type === "ONLINE" ||
        c.location?.isOnline ||
        communityIdsWithinDistance.has(c.id)
    );
  }

  return communities;
}

/**
 * Get community by ID with full details.
 * Returns null if community is not approved or doesn't exist.
 */
export async function getCommunityById(communityId: string, userId?: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      location: true,
      submission: true,
      organizers: {
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
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!community || community.submission?.status !== "APPROVED") {
    return null;
  }

  // Check if user is member
  let isMember = false;
  let joinRequestStatus: "PENDING" | "APPROVED" | "REJECTED" | null = null;

  if (userId) {
    const membership = await prisma.communityMembership.findUnique({
      where: {
        communityId_userId: { communityId, userId },
      },
    });
    isMember = !!membership;

    if (!isMember && community.accessType === "PRIVATE") {
      const joinRequest = await prisma.communityJoinRequest.findUnique({
        where: {
          communityId_userId: { communityId, userId },
        },
      });
      joinRequestStatus = joinRequest?.status || null;
    }
  }

  return {
    ...community,
    isMember,
    joinRequestStatus,
  };
}

/**
 * Submit a new community for admin approval.
 * Only verified users can submit.
 */
export async function submitCommunity(
  userId: string,
  data: CreateCommunityInput
) {
  // Create community with submission in transaction
  return await prisma.$transaction(async (tx) => {
    const community = await tx.community.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        accessType: data.accessType,
        categories: data.categories,
        externalLinks: data.externalLinks || [],
        location:
          data.type === "OFFLINE"
            ? {
                create: {
                  area: data.area,
                  addressText: data.addressText,
                  coordinates: data.coordinates
                    ? Prisma.sql`ST_GeographyFromText('POINT(${data.coordinates.lng} ${data.coordinates.lat})')`
                    : undefined,
                  isOnline: false,
                },
              }
            : {
                create: {
                  isOnline: true,
                },
              },
        submission: {
          create: {
            userId,
            status: "PENDING",
          },
        },
      },
      include: {
        location: true,
        submission: true,
      },
    });

    return community;
  });
}

/**
 * Get communities organized by user.
 */
export async function getOrganizedCommunities(userId: string) {
  return await prisma.community.findMany({
    where: {
      organizers: {
        some: {
          userId,
        },
      },
      submission: {
        status: "APPROVED",
      },
    },
    include: {
      location: true,
      _count: {
        select: {
          members: true,
          events: true,
        },
      },
    },
  });
}

/**
 * Get communities user is member of.
 */
export async function getUserCommunities(userId: string) {
  return await prisma.community.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
      submission: {
        status: "APPROVED",
      },
    },
    include: {
      location: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}
