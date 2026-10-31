import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getNotifications,
  getUnreadCounts,
  markNotificationsRead,
} from "@/server/notifications";
import { errorResponse } from "@/lib/api-error";

/**
 * List the notifications of the current user, with the unread count used by
 * the bell badge.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const [notifications, unreadCounts] = await Promise.all([
      getNotifications(session.user.id),
      getUnreadCounts(session.user.id),
    ]);

    return NextResponse.json({ notifications, unreadCounts });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Mark notifications as read. Without an id every notification is marked.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const body = (await request.json().catch(() => ({}))) as { id?: string };
    await markNotificationsRead(session.user.id, body.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
