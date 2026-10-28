import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { registerForEvent, cancelEventRegistration } from "@/server/events";
import { errorResponse } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: eventId } = await params;
    const result = await registerForEvent(session.user.id, eventId);

    return NextResponse.json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: eventId } = await params;
    const result = await cancelEventRegistration(session.user.id, eventId);

    return NextResponse.json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
