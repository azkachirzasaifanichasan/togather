import { NextRequest, NextResponse } from "next/server";
import { getDiscoveryCommunities } from "@/server/communities";
import { discoveryFilterSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query params - only include if present
    const filters: any = {};
    
    const categories = searchParams.getAll("categories");
    if (categories.length > 0) {
      filters.categories = categories;
    }
    
    const distance = searchParams.get("distance");
    if (distance) {
      filters.distance = parseFloat(distance);
    }
    
    const userLat = searchParams.get("userLat");
    if (userLat) {
      filters.userLat = parseFloat(userLat);
    }
    
    const userLng = searchParams.get("userLng");
    if (userLng) {
      filters.userLng = parseFloat(userLng);
    }
    
    const area = searchParams.get("area");
    if (area) {
      filters.area = area;
    }
    
    const type = searchParams.get("type");
    if (type) {
      filters.type = type;
    }
    
    const accessType = searchParams.get("accessType");
    if (accessType) {
      filters.accessType = accessType;
    }

    // Validate filters only if there are any
    const validatedFilters = Object.keys(filters).length > 0 
      ? discoveryFilterSchema.parse(filters) 
      : {};

    const communities = await getDiscoveryCommunities(validatedFilters);

    return NextResponse.json(communities);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
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
