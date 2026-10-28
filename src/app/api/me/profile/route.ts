import { NextRequest, NextResponse } from "next/server";
import { getAccountContext } from "@/server/auth";
import { updateUserProfile } from "@/server/users";
import { updateProfileSchema } from "@/lib/validations";
import { errorResponse } from "@/lib/api-error";

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getAccountContext();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    // The user id always comes from the session, never from the body.
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const profile = await updateUserProfile(ctx.userId, data);

    return NextResponse.json({
      success: true,
      profile: {
        name: profile.name,
        phone: profile.phone,
        phoneVerifiedAt: profile.phoneVerifiedAt,
        domicile: profile.domicile,
        interests: profile.interests,
        bio: profile.bio,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
