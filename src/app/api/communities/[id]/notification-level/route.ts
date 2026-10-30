import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getNotificationLevel, setNotificationLevel } from "@/server/notifications";
import { errorResponse } from "@/lib/api-error";
import { notificationLevelSchema } from "@/lib/validations";

/**
 * The notification level of the current user for one community.
 *
 * The level decides which notifications are delivered at all:
 * ALL (everything), PERSONAL (only likes/comments/shares on the user's own
 * posts) or OFF (nothing).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: communityId } = await params;
    const level = await getNotificationLevel(session.user.id, communityId);

    return NextResponse.json({ level });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: communityId } = await params;
    const body = notificationLevelSchema.parse(await request.json());

    const result = await setNotificationLevel(
      session.user.id,
      communityId,
      body.level
    );

    return NextResponse.json({ success: true, level: result.level });
  } catch (error) {
    return errorResponse(error);
  }
}
