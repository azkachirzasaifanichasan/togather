import { NextResponse } from "next/server";
import { getAccountContext } from "@/server/auth";
import { getUserWithProfile } from "@/server/users";
import { errorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    const ctx = await getAccountContext();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const user = await getUserWithProfile(ctx.userId);

    if (!user) {
      throw new Error("UNAUTHORIZED");
    }

    const profile = user.profile;
    const isComplete = Boolean(
      profile &&
        profile.name &&
        profile.phone &&
        profile.domicile &&
        profile.interests.length > 0 &&
        profile.bio
    );

    return NextResponse.json({
      status: ctx.status,
      userId: user.id,
      isAdmin: ctx.isAdmin,
      isComplete,
      profile: profile
        ? {
            name: profile.name,
            phone: profile.phone,
            phoneVerifiedAt: profile.phoneVerifiedAt,
            domicile: profile.domicile,
            interests: profile.interests,
            bio: profile.bio,
          }
        : null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
