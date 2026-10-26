import { NextRequest, NextResponse } from "next/server";
import { getDiscoveryEvents } from "@/server/events";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      categories: searchParams.getAll("categories"),
      area: searchParams.get("area") || undefined,
      status: searchParams.get("status") as any,
    };

    const events = await getDiscoveryEvents(filters);

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
