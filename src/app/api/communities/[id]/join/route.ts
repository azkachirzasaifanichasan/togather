import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { joinCommunity, leaveCommunity } from "@/server/membership";
import { errorResponse } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: communityId } = await params;
    const result = await joinCommunity(session.user.id, communityId);

    return NextResponse.json({
      success: true,
      status: result.status,
      ...(result.status === "request_exists" && {
        requestStatus: result.requestStatus,
      }),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const { id: communityId } = await params;
    const result = await leaveCommunity(session.user.id, communityId);

    return NextResponse.json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
