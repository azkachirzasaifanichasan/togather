import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPostComments, createComment } from "@/server/posts";
import { ApiError, ErrorCode, errorResponse } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { createCommentSchema } from "@/lib/validations";

/**
 * List the comments of a post, or add a new one.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await auth();
    const comments = await getPostComments(postId, session?.user?.id);

    return NextResponse.json({ comments });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const rl = rateLimit(`comment:user:${session.user.id}`, 20, 5 * 60 * 1000);
    if (!rl.success) {
      throw new ApiError(
        429,
        ErrorCode.RATE_LIMITED,
        "Terlalu sering mengirim komentar. Silakan tunggu beberapa saat."
      );
    }

    const { postId } = await params;
    const body = createCommentSchema.parse(await request.json());

    const comment = await createComment(
      session.user.id,
      postId,
      body.content,
      body.parentId
    );

    return NextResponse.json({ success: true, ...comment });
  } catch (error) {
    return errorResponse(error);
  }
}
