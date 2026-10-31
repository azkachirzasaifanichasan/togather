import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPost, getCommunityPosts } from "@/server/posts";
import { ApiError, ErrorCode, errorResponse } from "@/lib/api-error";
import { rateLimit } from "@/lib/rate-limit";
import { createPostSchema } from "@/lib/validations";

/**
 * List the posts of a community, or create a new one.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params;
    const session = await auth();

    const posts = await getCommunityPosts(
      communityId,
      session?.user?.id,
      Number(request.nextUrl.searchParams.get("limit")) || undefined
    );

    return NextResponse.json({ posts });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const rl = rateLimit(`post:user:${session.user.id}`, 10, 5 * 60 * 1000);
    if (!rl.success) {
      throw new ApiError(
        429,
        ErrorCode.RATE_LIMITED,
        "Terlalu sering membuat postingan. Silakan tunggu beberapa saat."
      );
    }

    const { id: communityId } = await params;
    const body = createPostSchema.parse(await request.json());

    const post = await createPost(
      session.user.id,
      communityId,
      body.content,
      body.media
    );

    return NextResponse.json({ success: true, ...post });
  } catch (error) {
    return errorResponse(error);
  }
}
