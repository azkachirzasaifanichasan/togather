import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleLike } from "@/server/posts";
import { errorResponse } from "@/lib/api-error";

/**
 * Toggle the like on a post.
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
    const result = await toggleLike(session.user.id, postId);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
