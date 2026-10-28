import { NextResponse } from "next/server";
import { getAccountContext } from "@/server/auth";
import { getUserCommunities } from "@/server/communities";
import { errorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const ctx = await getAccountContext();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const communities = await getUserCommunities(ctx.userId);

    return NextResponse.json({ communities });
  } catch (error) {
    return errorResponse(error);
  }
}
