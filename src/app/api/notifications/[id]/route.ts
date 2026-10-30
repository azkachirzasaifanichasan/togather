import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setNotificationMuted } from "@/server/notifications";
import { errorResponse } from "@/lib/api-error";

/**
 * Mute or unmute a single notification.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { muted?: boolean };

    await setNotificationMuted(session.user.id, id, body.muted !== false);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
