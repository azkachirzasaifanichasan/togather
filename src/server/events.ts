import { prisma } from "@/lib/prisma";
import { CreateEventInput, UpdateEventInput } from "@/lib/validations";
import { Prisma } from "@prisma/client";

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
 * Get published events for discovery.
 */
export async function getDiscoveryEvents(filters: {
  categories?: string[];
  area?: string;
  status?: "MENDATANG" | "BERLANGSUNG" | "SELESAI";
} = {}) {
  const where: Prisma.EventWhereInput = {
    isPublished: true,
  };

  if (filters.categories && filters.categories.length > 0) {
    where.category = {
      in: filters.categories as any,
    };
  }

  if (filters.area) {
    where.area = filters.area as any;
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

  // Filter by status if provided
  if (filters.status) {
    return events.filter(
      (event) => getEventStatus(event.startDate, event.endDate) === filters.status
    );
  }

  return events;
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
 * Register for an event.
 */
export async function registerForEvent(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
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
    throw new Error("Event not found");
  }

  const status = getEventStatus(event.startDate, event.endDate);
  if (status === "SELESAI") {
    throw new Error("Event already ended");
  }

  if (!event.registrationOpen) {
    throw new Error("Registration is closed for this event");
  }

  // Check quota
  if (event.quota && event._count.registrations >= event.quota) {
    throw new Error("Event is full");
  }

  // Check if already registered
  const existing = await prisma.eventRegistration.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  if (existing) {
    if (existing.cancelledAt) {
      // Re-register by clearing cancelledAt
      await prisma.eventRegistration.update({
        where: { id: existing.id },
        data: { cancelledAt: null },
      });
      return { status: "re-registered" as const };
    }
    return { status: "already_registered" as const };
  }

  // Create registration
  await prisma.eventRegistration.create({
    data: {
      eventId,
      userId,
    },
  });

  return { status: "registered" as const };
}

/**
 * Cancel event registration.
 */
export async function cancelEventRegistration(userId: string, eventId: string) {
  const registration = await prisma.eventRegistration.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  if (!registration || registration.cancelledAt) {
    throw new Error("Registration not found");
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
  return await prisma.event.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      startTime: data.startTime,
      venue: data.venue,
      area: data.area,
      coordinates: data.coordinates
        ? Prisma.sql`ST_GeographyFromText('POINT(${data.coordinates.lng} ${data.coordinates.lat})')`
        : undefined,
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
}

/**
 * Update an event (admin only).
 */
export async function updateEvent(eventId: string, data: UpdateEventInput) {
  return await prisma.event.update({
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
}

/**
 * Get user's event registrations.
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
        },
      },
    },
    orderBy: {
      registeredAt: "desc",
    },
  });

  const now = new Date();
  const filtered = registrations.filter((reg) => {
    const eventStatus = getEventStatus(reg.event.startDate, reg.event.endDate);
    if (status === "TERDAFTAR") {
      return eventStatus === "MENDATANG" || eventStatus === "BERLANGSUNG";
    } else if (status === "RIWAYAT") {
      return eventStatus === "SELESAI";
    }
    return true;
  });

  return filtered;
}
