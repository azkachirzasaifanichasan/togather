import { NextRequest, NextResponse } from "next/server";
import { getDiscoveryCommunities, submitCommunity } from "@/server/communities";
import {
  communityDiscoveryQuerySchema,
  createCommunitySchema,
  type CommunityDiscoveryQuery,
} from "@/lib/validations";
import { requireVerified } from "@/server/auth";
import { errorResponse } from "@/lib/api-error";
import { z } from "zod";

/**
 * Build the discovery query from the raw URL search params.
 *
 * Empty values (`?area=`) are treated as "no filter" rather than a validation
 * error, so they must be dropped before the schema runs.
 */
function parseQuery(searchParams: URLSearchParams): CommunityDiscoveryQuery {
  const categories = searchParams
    .getAll("categories")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const area = searchParams.get("area")?.trim();
  const type = searchParams.get("type")?.trim();
  const accessType = searchParams.get("accessType")?.trim();
  const search = searchParams.get("search")?.trim();

  const latRaw = searchParams.get("lat")?.trim();
  const lngRaw = searchParams.get("lng")?.trim();
  const distanceRaw = searchParams.get("distance")?.trim();

  const swLat = searchParams.get("sw_lat")?.trim();
  const swLng = searchParams.get("sw_lng")?.trim();
  const neLat = searchParams.get("ne_lat")?.trim();
  const neLng = searchParams.get("ne_lng")?.trim();

  const raw: Record<string, unknown> = {};

  if (categories.length > 0) {
    raw.categories = categories;
  }
  if (area) {
    raw.area = area;
  }
  if (type) {
    raw.type = type;
  }
  if (accessType) {
    raw.accessType = accessType;
  }
  if (search) {
    raw.search = search;
  }
  if (latRaw) {
    raw.lat = Number(latRaw);
  }
  if (lngRaw) {
    raw.lng = Number(lngRaw);
  }
  if (distanceRaw) {
    raw.distance = Number(distanceRaw);
  }
  if (swLat && swLng && neLat && neLng) {
    raw.bounds = {
      sw_lat: Number(swLat),
      sw_lng: Number(swLng),
      ne_lat: Number(neLat),
      ne_lng: Number(neLng),
    };
  }

  return communityDiscoveryQuerySchema.parse(raw);
}

export async function GET(request: NextRequest) {
  try {
    const filters = parseQuery(request.nextUrl.searchParams);

    const communities = await getDiscoveryCommunities({
      categories: filters.categories,
      area: filters.area,
      type: filters.type,
      accessType: filters.accessType,
      search: filters.search,
      distance: filters.distance,
      userLat: filters.lat,
      userLng: filters.lng,
    });

    return NextResponse.json({ communities });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid discovery filters",
            details: error.issues,
          },
        },
        { status: 422 }
      );
    }

    console.error("Error fetching communities:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch communities",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Submit a new community for admin approval.
 * Requires a VERIFIED profile. The submitter is taken from the session.
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await requireVerified();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const body = await request.json();
    const data = createCommunitySchema.parse(body);

    const community = await submitCommunity(ctx.userId, data);

    return NextResponse.json(
      {
        success: true,
        communityId: community.id,
        submissionStatus: "PENDING",
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
