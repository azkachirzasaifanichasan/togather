import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getNotifications,
  getUnreadCounts,
  markNotificationsRead,
} from "@/server/notifications";
import { errorResponse } from "@/lib/api-error";
import type { NotificationTab } from "@/server/notifications";

const TABS: NotificationTab[] = ["all", "personal", "off"];

/**
 * List the notifications of the current user for one tab of the bell
 * dropdown, with the unread counts used by the tabs and the bell badge.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const requested = request.nextUrl.searchParams.get("tab") as NotificationTab | null;
    const tab: NotificationTab = requested && TABS.includes(requested) ? requested : "all";

    const [notifications, unreadCounts] = await Promise.all([
      getNotifications(session.user.id, tab),
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
