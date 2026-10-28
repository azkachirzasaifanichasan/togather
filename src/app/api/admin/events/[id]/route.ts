import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import { updateEvent } from "@/server/events";
import { updateEventSchema } from "@/lib/validations";
import { errorResponse } from "@/lib/api-error";

/**
 * Update an existing event. Admin only.
 *
 * Setting `isPublished: false` unpublishes the event: it disappears from the
 * public discovery endpoints but stays in the database.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id: eventId } = await params;

    const body = await request.json();
    const data = updateEventSchema.parse(body);

    const event = await updateEvent(eventId, data);

    return NextResponse.json({
      success: true,
      eventId: event.id,
      isPublished: event.isPublished,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
