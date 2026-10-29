import { prisma } from "@/lib/prisma";
import { CreateEventInput, UpdateEventInput } from "@/lib/validations";
import { Prisma, InterestCategory, Area, DataSource } from "@prisma/client";

/**
 * Get event status based on dates in Asia/Jakarta (WIB).
 */
export function getEventStatus(
  startDate: Date,
  endDate: Date | null
): "MENDATANG" | "BERLANGSUNG" | "SELESAI" {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  if (now < start) {
    return "MENDATANG";
  } else if (now >= start && now <= end) {
    return "BERLANGSUNG";
  } else {
    return "SELESAI";
  }
}

/**
 * Public summary shape for an event.
 * `title` is a deprecated alias of `name`; both are always equal.
 */
export type EventSummary = {
  id: string;
  name: string;
  /** @deprecated Use `name`. Kept only for `src/app/discovery/page.tsx`. */
  title: string;
  description: string;
  category: InterestCategory;
  /**
   * Data provenance label for the UI ("DEMO" | "REFERENCE_UNVERIFIED").
   * Required by PRD 4.3 / implementation notes item 10 so the frontend can
   * render a visible source badge.
   */
  dataSource: DataSource;
  startDate: Date;
  endDate: Date | null;
  startTime: string | null;
  venue: string | null;
  area: Area | null;
  organizer: string;
  contactInfo: string | null;
  quota: number | null;
  registrationOpen: boolean;
  fee: string | null;
  externalLink: string | null;
  latitude: number | null;
  longitude: number | null;
  attendeeCount: number;
  status: "MENDATANG" | "BERLANGSUNG" | "SELESAI";
  relatedCommunities: Array<{ id: string; name: string }>;
  /** Distance in km. Only present when a `lat` + `lng` + `distance` filter was used. */
  distance?: number;
};

type EventRow = Prisma.EventGetPayload<{
  include: {
    relatedCommunities: {
      include: { community: { select: { id: true; name: true } } };
    };
    _count: { select: { registrations: { where: { cancelledAt: null } } } };
  };
}> & {
  latitude: number | null;
  longitude: number | null;
};

type CoordinateRow = {
  eventId: string;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Read the PostGIS coordinates of the given events in a single parameterized
 * query.
 */
async function loadEventCoordinates(
  eventIds: string[]
): Promise<Map<string, { latitude: number; longitude: number }>> {
  const map = new Map<string, { latitude: number; longitude: number }>();

  if (eventIds.length === 0) {
    return map;
  }

  const rows = await prisma.$queryRaw<CoordinateRow[]>`
    SELECT e.id AS "eventId",
           ST_Y(e.coordinates::geometry) AS latitude,
           ST_X(e.coordinates::geometry) AS longitude
    FROM "Event" e
    WHERE e.id IN (${Prisma.join(eventIds)})
      AND e.coordinates IS NOT NULL
  `;

  for (const row of rows) {
    if (row.latitude !== null && row.longitude !== null) {
      map.set(row.eventId, {
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
      });
    }
  }

  return map;
}

/**
 * Convert an event row into its public summary.
 */
function toEventSummary(event: EventRow): EventSummary {
  return {
    id: event.id,
    name: event.name,
    title: event.name,
    description: event.description,
    category: event.category,
    dataSource: event.dataSource,
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    venue: event.venue,
    area: event.area,
    organizer: event.organizer,
    contactInfo: event.contactInfo,
    quota: event.quota,
    registrationOpen: event.registrationOpen,
    fee: event.fee,
    externalLink: event.externalLink,
    latitude: event.latitude,
    longitude: event.longitude,
    attendeeCount: event._count.registrations,
    status: getEventStatus(event.startDate, event.endDate),
    relatedCommunities: event.relatedCommunities.map((rc) => rc.community),
  };
}

/**
 * Get published events for discovery.
 *
 * By default only upcoming (`MENDATANG`) and ongoing (`BERLANGSUNG`) events
 * are returned. Pass an explicit `status` to override that.
 */
export async function getDiscoveryEvents(
  filters: {
    categories?: InterestCategory[];
    area?: Area;
    status?: "MENDATANG" | "BERLANGSUNG" | "SELESAI";
    search?: string;
    startDate?: string;
    distance?: number;
    userLat?: number;
    userLng?: number;
  } = {}
) {
  const where: Prisma.EventWhereInput = {
    isPublished: true,
  };

  if (filters.categories && filters.categories.length > 0) {
    where.category = {
      in: filters.categories,
    };
  }

  if (filters.area) {
    where.area = filters.area;
  }

  // Search on name, description and organizer, case-insensitive
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { organizer: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.startDate) {
    where.startDate = { gte: new Date(filters.startDate) };
  }

  const events = await prisma.event.findMany({
    where,
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
      startDate: "asc",
    },
  });

  const coordinates = await loadEventCoordinates(events.map((e) => e.id));

  const enriched = events.map((e) => {
    const coord = coordinates.get(e.id);
    return {
      ...e,
      latitude: coord?.latitude ?? null,
      longitude: coord?.longitude ?? null,
    } as EventRow;
  });

  // Filter by status. Without an explicit status, only upcoming and ongoing
  // events are visible.
  let filtered = enriched.filter((event) => {
    const status = getEventStatus(event.startDate, event.endDate);
    if (filters.status) {
      return status === filters.status;
    }
    return status === "MENDATANG" || status === "BERLANGSUNG";
  });

  // Distance filtering. Events without coordinates are excluded from a
  // distance result because their position is unknown.
  if (
    filters.distance &&
    filters.userLat !== undefined &&
    filters.userLng !== undefined
  ) {
    if (filtered.length === 0) {
      return [];
    }

    const distanceInMeters = filters.distance * 1000;
    const ids = filtered.map((e) => e.id);

    const rows = await prisma.$queryRaw<
      Array<{ id: string; distance: number }>
    >`
      SELECT e.id,
             ST_Distance(
               e.coordinates,
               ST_SetSRID(ST_MakePoint(${filters.userLng}, ${filters.userLat}), 4326)::geography
             ) / 1000.0 AS distance
      FROM "Event" e
      WHERE e.id IN (${Prisma.join(ids)})
        AND e.coordinates IS NOT NULL
        AND ST_DWithin(
              e.coordinates,
              ST_SetSRID(ST_MakePoint(${filters.userLng}, ${filters.userLat}), 4326)::geography,
              ${distanceInMeters}
            )
      ORDER BY distance ASC
    `;

    const distanceById = new Map(rows.map((r) => [r.id, Number(r.distance)]));
    filtered = filtered
      .filter((e) => distanceById.has(e.id))
      .sort(
        (a, b) =>
          (distanceById.get(a.id) ?? 0) - (distanceById.get(b.id) ?? 0)
      );

    return filtered.map((event) => {
      const summary = toEventSummary(event);
      const distance = distanceById.get(event.id);
      return distance !== undefined ? { ...summary, distance } : summary;
    });
  }

  return filtered.map(toEventSummary);
}

/**
 * Get event by ID with registration status.
 */
export async function getEventById(eventId: string, userId?: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
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
  });

  if (!event || !event.isPublished) {
    return null;
  }

  let isRegistered = false;
  let registration = null;

  if (userId) {
    registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });
    isRegistered = !!registration && !registration.cancelledAt;
  }

  return {
    ...event,
    status: getEventStatus(event.startDate, event.endDate),
    isRegistered,
    registration,
  };
}

/**
 * Public detail DTO for an event.
 * Deliberately excludes `createdBy` and `dataSource`.
 */
export async function getPublicEventById(eventId: string, userId?: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
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
  });

  if (!event || !event.isPublished) {
    return null;
  }

  let isRegistered = false;

  if (userId) {
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });
    isRegistered = !!registration && !registration.cancelledAt;
  }

  const coordinates = await loadEventCoordinates([event.id]);
  const coord = coordinates.get(event.id);

  const summary = toEventSummary({
    ...event,
    latitude: coord?.latitude ?? null,
    longitude: coord?.longitude ?? null,
  } as EventRow);

  return {
    ...summary,
    isRegistered,
  };
}

/**
 * Register for an event.
 *
 * The quota is enforced inside a serializable transaction so a full event can
 * never be over-subscribed. A serialization failure (P2034) is retried once.
 */
export async function registerForEvent(userId: string, eventId: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const event = await tx.event.findUnique({
            where: { id: eventId },
          });

          if (!event || !event.isPublished) {
            throw new Error("EVENT_NOT_FOUND");
          }

          if (!event.registrationOpen) {
            throw new Error("REGISTRATION_CLOSED");
          }

          const status = getEventStatus(event.startDate, event.endDate);
          if (status === "SELESAI") {
            throw new Error("EVENT_ENDED");
          }

          const count = await tx.eventRegistration.count({
            where: { eventId, cancelledAt: null },
          });

          if (event.quota && count >= event.quota) {
            throw new Error("EVENT_FULL");
          }

          const existing = await tx.eventRegistration.findUnique({
            where: {
              eventId_userId: { eventId, userId },
            },
          });

          if (existing && !existing.cancelledAt) {
            return { status: "already_registered" as const };
          }

          await tx.eventRegistration.upsert({
            where: { eventId_userId: { eventId, userId } },
            create: { eventId, userId },
            update: { cancelledAt: null, registeredAt: new Date() },
          });

          return {
            status: existing ? ("re_registered" as const) : ("registered" as const),
          };
        },
        { isolationLevel: "Serializable" }
      );
    } catch (error) {
      // Serialization failure — retry once.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt === 0
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("EVENT_FULL");
}

/**
 * Cancel event registration.
 * Idempotent: cancelling a registration that does not exist is a success.
 */
export async function cancelEventRegistration(userId: string, eventId: string) {
  const registration = await prisma.eventRegistration.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  if (!registration || registration.cancelledAt) {
    return { status: "not_registered" as const };
  }

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: {
      cancelledAt: new Date(),
    },
  });

  return { status: "cancelled" as const };
}

/**
 * Create a new event (admin only).
 */
export async function createEvent(adminUserId: string, data: CreateEventInput) {
  return await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        startTime: data.startTime,
        venue: data.venue,
        area: data.area,
        organizer: data.organizer,
        contactInfo: data.contactInfo,
        quota: data.quota,
        registrationOpen: data.registrationOpen,
        fee: data.fee,
        externalLink: data.externalLink,
        dataSource: data.dataSource,
        isPublished: true,
        createdBy: adminUserId,
        publishedAt: new Date(),
        relatedCommunities: data.relatedCommunityId
          ? {
              create: {
                communityId: data.relatedCommunityId,
              },
            }
          : undefined,
      },
      include: {
        relatedCommunities: {
          include: {
            community: true,
          },
        },
      },
    });

    // PostGIS geography columns are `Unsupported` in Prisma, so coordinates are
    // written with a parameterized raw query once the row exists.
    if (data.coordinates) {
      await tx.$executeRaw`
        UPDATE "Event"
        SET coordinates = ST_SetSRID(
          ST_MakePoint(${data.coordinates.lng}, ${data.coordinates.lat}),
          4326
        )::geography
        WHERE id = ${event.id}
      `;
    }

    return event;
  });
}

/**
 * Update an event (admin only).
 */
export async function updateEvent(eventId: string, data: UpdateEventInput) {
  return await prisma.$transaction(async (tx) => {
    const event = await tx.event.update({
      where: { id: eventId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.venue !== undefined && { venue: data.venue }),
        ...(data.area !== undefined && { area: data.area }),
        ...(data.organizer && { organizer: data.organizer }),
        ...(data.contactInfo !== undefined && { contactInfo: data.contactInfo }),
        ...(data.quota !== undefined && { quota: data.quota }),
        ...(data.registrationOpen !== undefined && {
          registrationOpen: data.registrationOpen,
        }),
        ...(data.fee !== undefined && { fee: data.fee }),
        ...(data.externalLink !== undefined && { externalLink: data.externalLink }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
    });

    // PostGIS geography columns are `Unsupported` in Prisma, so coordinates are
    // written with a parameterized raw query once the row exists.
    if (data.coordinates) {
      await tx.$executeRaw`
        UPDATE "Event"
        SET coordinates = ST_SetSRID(
          ST_MakePoint(${data.coordinates.lng}, ${data.coordinates.lat}),
          4326
        )::geography
        WHERE id = ${event.id}
      `;
    }

    return event;
  });
}

/**
 * Get user's event registrations.
 *
 * `status` narrows to upcoming/ongoing (`TERDAFTAR`) or past (`RIWAYAT`).
 * Each registration is returned with the public event DTO so the caller never
 * receives internal event fields.
 */
export async function getUserEventRegistrations(
  userId: string,
  status?: "TERDAFTAR" | "RIWAYAT"
) {
  const registrations = await prisma.eventRegistration.findMany({
    where: {
      userId,
      cancelledAt: null,
    },
    include: {
      event: {
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
      },
      attendance: true,
    },
    orderBy: {
      registeredAt: "desc",
    },
  });

  const filtered = registrations.filter((reg) => {
    const eventStatus = getEventStatus(reg.event.startDate, reg.event.endDate);
    if (status === "TERDAFTAR") {
      return eventStatus === "MENDATANG" || eventStatus === "BERLANGSUNG";
    } else if (status === "RIWAYAT") {
      return eventStatus === "SELESAI";
    }
    return true;
  });

  if (filtered.length === 0) {
    return [];
  }

  const coordinates = await loadEventCoordinates(
    filtered.map((reg) => reg.event.id)
  );

  return filtered.map((reg) => {
    const coord = coordinates.get(reg.event.id);
    return {
      registrationId: reg.id,
      registeredAt: reg.registeredAt,
      cancelledAt: reg.cancelledAt,
      attended: reg.attendance?.attended ?? null,
      event: toEventSummary({
        ...reg.event,
        latitude: coord?.latitude ?? null,
        longitude: coord?.longitude ?? null,
      } as EventRow),
    };
  });
}
/**
 * Get upcoming events for guests (no authentication required)
 */
export async function getUpcomingEvents(): Promise<EventSummary[]> {
  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      OR: [
        {
          startDate: {
            gte: new Date(),
          },
        },
        {
          endDate: {
            gte: new Date(),
          },
        },
      ],
    },
    include: {
      relatedCommunities: {
        select: {
          community: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 1,
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
      startDate: "asc",
    },
    take: 20, // Limit untuk halaman guest
  });

  const coordinates = await loadEventCoordinates(events.map((e) => e.id));

  return events.map((event) => {
    const coord = coordinates.get(event.id);
    // Transform relatedCommunities untuk match format EventSummary
    const transformedEvent = {
      ...event,
      relatedCommunities: event.relatedCommunities.map(rc => rc.community),
    };
    return toEventSummary({
      ...transformedEvent,
      latitude: coord?.latitude ?? null,
      longitude: coord?.longitude ?? null,
    } as EventRow);
  });
}