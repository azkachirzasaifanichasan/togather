import { NextRequest, NextResponse } from "next/server";
import { getPublicCommunityById } from "@/server/communities";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    const userId = session?.user?.id;

    const community = await getPublicCommunityById(id, userId);

    if (!community) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Community not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(community);
  } catch (error) {
    console.error("Error fetching community:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch community",
        },
      },
      { status: 500 }
    );
  }
}
