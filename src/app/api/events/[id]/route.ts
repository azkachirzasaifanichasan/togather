import { NextRequest, NextResponse } from "next/server";
import { getPublicEventById } from "@/server/events";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const userId = session?.user?.id;

    const event = await getPublicEventById(id, userId);

    if (!event) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Event not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch event",
        },
      },
      { status: 500 }
    );
  }
}
