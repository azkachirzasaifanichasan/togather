import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth";
import {
  deleteCommunityAsAdmin,
  updateCommunityAsAdmin,
} from "@/server/admin";
import { updateCommunitySchema } from "@/lib/validations";
import { errorResponse } from "@/lib/api-error";

/**
 * Edit any community. Admin only.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id: communityId } = await params;
    const body = await request.json();
    const data = updateCommunitySchema.parse(body);

    const community = await updateCommunityAsAdmin(communityId, data);

    return NextResponse.json({ success: true, communityId: community.id });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Hard-delete a community. Admin only. Event rows survive; only the
 * community↔event links, members, organizers and submission are removed.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id: communityId } = await params;
    await deleteCommunityAsAdmin(communityId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
