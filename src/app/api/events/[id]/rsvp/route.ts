import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const eventId = id;

    // Check if event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          where: {
            cancelledAt: null,
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Only allow RSVP to published events
    if (!event.isPublished) {
      return NextResponse.json(
        { error: "Event is not published" },
        { status: 403 }
      );
    }

    // Check if event has passed
    if (event.startDate < new Date()) {
      return NextResponse.json(
        { error: "Event has already started or passed" },
        { status: 400 }
      );
    }

    // Check if registration is open
    if (!event.registrationOpen) {
      return NextResponse.json(
        { error: "Registration is not open for this event" },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        }
      }
    });

    if (existingRegistration && !existingRegistration.cancelledAt) {
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 400 }
      );
    }

    // If previously cancelled, allow re-registration
    if (existingRegistration && existingRegistration.cancelledAt) {
      const updatedRegistration = await prisma.eventRegistration.update({
        where: {
          id: existingRegistration.id,
        },
        data: {
          cancelledAt: null,
          registeredAt: new Date(),
        }
      });

      return NextResponse.json({
        success: true,
        registration: updatedRegistration,
        message: "Successfully re-registered for the event"
      });
    }

    // Check capacity if quota is set
    if (event.quota) {
      const activeRegistrations = event.registrations.length;
      if (activeRegistrations >= event.quota) {
        return NextResponse.json(
          { error: "Event is at full capacity" },
          { status: 400 }
        );
      }
    }

    // Create new registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId: session.user.id,
      }
    });

    return NextResponse.json({
      success: true,
      registration,
      message: "Successfully registered for the event"
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}
