import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const communityId = params.id;

    // Check if community exists and is approved
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        submission: true,
      }
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Only allow joining approved communities
    if (community.submission?.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Community is not approved yet" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.communityMembership.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: user.id,
        }
      }
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Already a member of this community" },
        { status: 400 }
      );
    }

    // Handle based on access type
    if (community.accessType === "PUBLIC") {
      // Public communities - immediate join
      const membership = await prisma.communityMembership.create({
        data: {
          communityId,
          userId: user.id,
        }
      });

      return NextResponse.json({
        success: true,
        membership,
        message: "Successfully joined the community"
      });
    } else {
      // Private communities - create join request
      const existingRequest = await prisma.communityJoinRequest.findUnique({
        where: {
          communityId_userId: {
            communityId,
            userId: user.id,
          }
        }
      });

      if (existingRequest) {
        return NextResponse.json(
          { error: "Join request already pending" },
          { status: 400 }
        );
      }

      const joinRequest = await prisma.communityJoinRequest.create({
        data: {
          communityId,
          userId: user.id,
          status: "PENDING",
        }
      });

      return NextResponse.json({
        success: true,
        joinRequest,
        message: "Join request submitted, awaiting approval"
      });
    }
  } catch (error) {
    console.error("Error joining community:", error);
    return NextResponse.json(
      { error: "Failed to join community" },
      { status: 500 }
    );
  }
}
