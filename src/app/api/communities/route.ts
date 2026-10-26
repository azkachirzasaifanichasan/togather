import { NextRequest, NextResponse } from "next/server";
import { getDiscoveryCommunities } from "@/server/communities";
import { discoveryFilterSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query params
    const filters = {
      categories: searchParams.getAll("categories"),
      distance: searchParams.get("distance")
        ? parseFloat(searchParams.get("distance")!)
        : undefined,
      userLat: searchParams.get("userLat")
        ? parseFloat(searchParams.get("userLat")!)
        : undefined,
      userLng: searchParams.get("userLng")
        ? parseFloat(searchParams.get("userLng")!)
        : undefined,
      area: searchParams.get("area") || undefined,
      type: searchParams.get("type") as any,
      accessType: searchParams.get("accessType") as any,
    };

    // Validate filters
    const validatedFilters = discoveryFilterSchema.parse(filters);

    const communities = await getDiscoveryCommunities(validatedFilters);

    return NextResponse.json(communities);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid filters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}
