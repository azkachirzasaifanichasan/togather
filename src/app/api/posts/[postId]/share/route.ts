import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sharePost } from "@/server/posts";
import { errorResponse } from "@/lib/api-error";

/**
 * Share a post. Shares are counted, not re-posted.
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
    const result = await sharePost(session.user.id, postId);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
