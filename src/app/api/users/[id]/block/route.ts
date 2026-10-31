import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { errorResponse } from "@/lib/api-error";
import { toggleBlock, unblockUser } from "@/server/moderation";

/**
 * Toggle a block against another user. Blocking is mutual for feed visibility.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;
    const result = await toggleBlock(session.user.id, id);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Remove a block. The settings block list calls this directly instead of the
 * toggle, so stale UI cannot end up re-blocking a user.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { id } = await params;
    const result = await unblockUser(session.user.id, id);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
