import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import { getAllEventsForAdmin } from "@/server/admin";
import { createEvent } from "@/server/events";
import { createEventSchema } from "@/lib/validations";
import { errorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    await requireAdmin();

    const events = await getAllEventsForAdmin();

    return NextResponse.json({
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        category: e.category,
        dataSource: e.dataSource,
        startDate: e.startDate,
        endDate: e.endDate,
        startTime: e.startTime,
        venue: e.venue,
        area: e.area,
        organizer: e.organizer,
        contactInfo: e.contactInfo,
        quota: e.quota,
        registrationOpen: e.registrationOpen,
        fee: e.fee,
        externalLink: e.externalLink,
        isPublished: e.isPublished,
        createdBy: e.createdBy,
        publishedAt: e.publishedAt,
        attendeeCount: e._count.registrations,
        relatedCommunities: e.relatedCommunities.map((rc) => rc.community),
        registrations: e.registrations.map((r) => ({
          id: r.id,
          userId: r.userId,
          registeredAt: r.registeredAt,
          attended: r.attendance?.attended ?? null,
          user: {
            id: r.user.id,
            email: r.user.email,
            name: r.user.profile?.name ?? null,
          },
        })),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Create a new event. Admin only.
 * The event is published immediately (`isPublished = true`).
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdmin();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await request.json();
    const data = createEventSchema.parse(body);

    const event = await createEvent(ctx.userId, data);

    return NextResponse.json(
      {
        success: true,
        eventId: event.id,
        isPublished: true,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
