import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleSave, unsavePost } from "@/server/posts";
import { errorResponse } from "@/lib/api-error";

/**
 * Toggle the save (bookmark) on a post.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { postId } = await params;
    const result = await toggleSave(session.user.id, postId);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Remove a save. The settings list calls this directly instead of the toggle,
 * so a stale page cannot end up re-saving a post.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { postId } = await params;
    const result = await unsavePost(session.user.id, postId);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
