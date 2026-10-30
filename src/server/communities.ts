import { prisma } from "@/lib/prisma";
import {
  CreateCommunityInput,
  DiscoveryFilterInput,
} from "@/lib/validations";
import { Prisma, InterestCategory, Area, DataSource } from "@prisma/client";

/**
 * Public summary shape for a community.
 * Never exposes emails, submission internals or reviewer information.
 */
export type CommunitySummary = {
  id: string;
  name: string;
  description: string;
  type: "ONLINE" | "OFFLINE";
  accessType: "PUBLIC" | "PRIVATE";
  categories: InterestCategory[];
  externalLinks: string[];
  /**
   * Data provenance label for the UI ("DEMO" | "REFERENCE_UNVERIFIED").
   * Required by PRD 4.3 / implementation notes item 10 so the frontend can
   * render a visible source badge.
   */
  dataSource: DataSource;
  area: Area | null;
  addressText: string | null;
  latitude: number | null;
  longitude: number | null;
  memberCount: number;
  distance?: number;
};

/**
 * A community row together with its PostGIS coordinates.
 * The coordinates live in an `Unsupported("geography(Point,4326)")` column, so
 * they are read with a parameterized raw query and merged in here.
 */
type CommunityRow = Prisma.CommunityGetPayload<{
  include: {
    location: true;
    _count: { select: { members: true } };
  };
}> & {
  latitude: number | null;
  longitude: number | null;
};

type CoordinateRow = {
  communityId: string;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Read the PostGIS coordinates of the given communities in a single
 * parameterized query. Communities without coordinates are simply absent
 * from the result map.
 */
async function loadCommunityCoordinates(
  communityIds: string[]
): Promise<Map<string, { latitude: number; longitude: number }>> {
  const map = new Map<string, { latitude: number; longitude: number }>();

  if (communityIds.length === 0) {
    return map;
  }

  const rows = await prisma.$queryRaw<CoordinateRow[]>`
    SELECT cl."communityId" AS "communityId",
           ST_Y(cl.coordinates::geometry) AS latitude,
           ST_X(cl.coordinates::geometry) AS longitude
    FROM "CommunityLocation" cl
    WHERE cl."communityId" IN (${Prisma.join(communityIds)})
      AND cl.coordinates IS NOT NULL
  `;

  for (const row of rows) {
    if (row.latitude !== null && row.longitude !== null) {
      map.set(row.communityId, {
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
      });
    }
  }

  return map;
}

/**
 * Convert a community row into its public summary.
 */
function toCommunitySummary(
  community: CommunityRow,
  distance?: number
): CommunitySummary {
  return {
    id: community.id,
    name: community.name,
    description: community.description,
    type: community.type,
    accessType: community.accessType,
    categories: community.categories,
    externalLinks: community.externalLinks,
    dataSource: community.dataSource,
    area: community.location?.area ?? null,
    addressText: community.location?.addressText ?? null,
    latitude: community.latitude,
    longitude: community.longitude,
    memberCount: community._count.members,
    ...(distance !== undefined && { distance }),
  };
}

/**
 * Get communities for discovery with filters.
 * Only returns approved communities — a community without an APPROVED
 * submission is never visible.
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

  // Search on name and description, case-insensitive
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
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
    // Nothing to filter — return an empty list instead of building an `IN ()`
    // clause with no values.
    if (communities.length === 0) {
      return [];
    }

    const distanceInMeters = filters.distance * 1000;
    const ids = communities.map((c) => c.id);

    // Use raw SQL for PostGIS distance calculation. The tagged template
    // parameterizes every value, so no user input is ever concatenated.
    const rows = await prisma.$queryRaw<
      Array<{ id: string; distance: number }>
    >`
      SELECT c.id,
             ST_Distance(
               cl.coordinates,
               ST_SetSRID(ST_MakePoint(${filters.userLng}, ${filters.userLat}), 4326)::geography
             ) / 1000.0 AS distance
      FROM "Community" c
      JOIN "CommunityLocation" cl ON cl."communityId" = c.id
      WHERE c.id IN (${Prisma.join(ids)})
        AND cl.coordinates IS NOT NULL
        AND ST_DWithin(
              cl.coordinates,
              ST_SetSRID(ST_MakePoint(${filters.userLng}, ${filters.userLat}), 4326)::geography,
              ${distanceInMeters}
            )
      ORDER BY distance ASC
    `;

    const distanceById = new Map(rows.map((r) => [r.id, Number(r.distance)]));
    const coordinates = await loadCommunityCoordinates(ids);

    // PRD 4.3 / implementation notes: when a distance filter is active,
    // ONLINE communities are EXCLUDED — they have no physical location, so a
    // distance result would be misleading. Without a distance filter they are
    // listed normally.
    return communities
      .filter((c) => distanceById.has(c.id))
      .map((c) => {
        const coord = coordinates.get(c.id);
        return toCommunitySummary(
          {
            ...c,
            latitude: coord?.latitude ?? null,
            longitude: coord?.longitude ?? null,
          },
          distanceById.get(c.id)
        );
      });
  }

  const coordinates = await loadCommunityCoordinates(
    communities.map((c) => c.id)
  );

  return communities.map((c) => {
    const coord = coordinates.get(c.id);
    return toCommunitySummary({
      ...c,
      latitude: coord?.latitude ?? null,
      longitude: coord?.longitude ?? null,
    });
  });
}

/**
 * Server-side view of a community profile page.
 *
 * The public DTO (`getPublicCommunityById`) is what the API exposes; a
 * server-rendered page may also show the hosts, so this adds exactly that
 * and nothing more.
 */
export async function getCommunityProfileById(
  communityId: string,
  userId?: string
) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      location: true,
      submission: { select: { status: true } },
      organizers: {
        include: {
          user: { select: { id: true, profile: { select: { name: true } } } },
        },
      },
      _count: { select: { members: true } },
    },
  });

  if (!community || community.submission?.status !== "APPROVED") {
    return null;
  }

  const isMember = userId
    ? (await prisma.communityMembership.count({
        where: { communityId, userId },
      })) > 0
    : false;

  const coordinates = await loadCommunityCoordinates([community.id]);
  const coord = coordinates.get(community.id);

  return {
    id: community.id,
    name: community.name,
    description: community.description,
    type: community.type,
    accessType: community.accessType,
    categories: community.categories,
    area: community.location?.area ?? null,
    addressText: community.location?.addressText ?? null,
    latitude: coord?.latitude ?? null,
    longitude: coord?.longitude ?? null,
    memberCount: community._count.members,
    isMember,
    hosts: community.organizers.map((o) => ({
      id: o.user.id,
      name: o.user.profile?.name ?? null,
    })),
  };
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
 * Public detail DTO for a community.
 * Deliberately excludes `submission`, organizer emails and reviewer info.
 */
export async function getPublicCommunityById(
  communityId: string,
  userId?: string
) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      location: true,
      submission: { select: { status: true } },
      _count: { select: { members: true } },
    },
  });

  if (!community || community.submission?.status !== "APPROVED") {
    return null;
  }

  let isMember = false;
  let joinRequestStatus: "PENDING" | "APPROVED" | "REJECTED" | null = null;

  if (userId) {
    const membership = await prisma.communityMembership.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    isMember = !!membership;

    if (!isMember && community.accessType === "PRIVATE") {
      const joinRequest = await prisma.communityJoinRequest.findUnique({
        where: { communityId_userId: { communityId, userId },
        },
      });
      joinRequestStatus = joinRequest?.status || null;
    }
  }

  const coordinates = await loadCommunityCoordinates([community.id]);
  const coord = coordinates.get(community.id);

  return {
    id: community.id,
    name: community.name,
    description: community.description,
    type: community.type,
    accessType: community.accessType,
    categories: community.categories,
    externalLinks: community.externalLinks,
    dataSource: community.dataSource,
    area: community.location?.area ?? null,
    addressText: community.location?.addressText ?? null,
    latitude: coord?.latitude ?? null,
    longitude: coord?.longitude ?? null,
    memberCount: community._count.members,
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

    // PostGIS geography columns are `Unsupported` in Prisma, so coordinates are
    // written with a parameterized raw query once the row exists.
    if (data.type === "OFFLINE" && data.coordinates) {
      await tx.$executeRaw`
        UPDATE "CommunityLocation"
        SET coordinates = ST_SetSRID(
          ST_MakePoint(${data.coordinates.lng}, ${data.coordinates.lat}),
          4326
        )::geography
        WHERE "communityId" = ${community.id}
      `;
    }

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
 * Get communities the user is a member of, plus the communities they organize.
 * Returns the public DTO shape (never emails or submission internals).
 */
export async function getUserCommunities(userId: string) {
  const [memberships, organizerRows] = await Promise.all([
    prisma.communityMembership.findMany({
      where: { userId },
      include: {
        community: {
          include: {
            location: true,
            submission: { select: { status: true } },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.communityOrganizer.findMany({
      where: { userId },
      select: { communityId: true },
    }),
  ]);

  const organizedIds = new Set(organizerRows.map((o) => o.communityId));

  const visible = memberships.filter(
    (m) => m.community.submission?.status === "APPROVED"
  );

  const coordinates = await loadCommunityCoordinates(
    visible.map((m) => m.community.id)
  );

  return visible.map((m) => {
    const coord = coordinates.get(m.community.id);
    return {
      id: m.community.id,
      name: m.community.name,
      description: m.community.description,
      type: m.community.type,
      accessType: m.community.accessType,
      categories: m.community.categories,
      dataSource: m.community.dataSource,
      area: m.community.location?.area ?? null,
      addressText: m.community.location?.addressText ?? null,
      latitude: coord?.latitude ?? null,
      longitude: coord?.longitude ?? null,
      memberCount: m.community._count.members,
      joinedAt: m.joinedAt,
      isOrganizer: organizedIds.has(m.community.id),
    };
  });
}

