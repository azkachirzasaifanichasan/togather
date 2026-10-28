import { NextRequest, NextResponse } from "next/server";
import { getDiscoveryEvents } from "@/server/events";
import {
  eventDiscoveryQuerySchema,
  type EventDiscoveryQuery,
} from "@/lib/validations";
import { z } from "zod";

/**
 * Build the discovery query from the raw URL search params.
 *
 * Empty values (`?area=`) are treated as "no filter" rather than a validation
 * error, so they must be dropped before the schema runs.
 */
function parseQuery(searchParams: URLSearchParams): EventDiscoveryQuery {
  const categories = searchParams
    .getAll("categories")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const area = searchParams.get("area")?.trim();
  const status = searchParams.get("status")?.trim();
  const search = searchParams.get("search")?.trim();
  const startDate = searchParams.get("startDate")?.trim();

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
  if (status) {
    raw.status = status;
  }
  if (search) {
    raw.search = search;
  }
  if (startDate) {
    raw.startDate = startDate;
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

  return eventDiscoveryQuerySchema.parse(raw);
}

export async function GET(request: NextRequest) {
  try {
    const filters = parseQuery(request.nextUrl.searchParams);

    const events = await getDiscoveryEvents({
      categories: filters.categories,
      area: filters.area,
      status: filters.status,
      search: filters.search,
      startDate: filters.startDate,
      distance: filters.distance,
      userLat: filters.lat,
      userLng: filters.lng,
    });

    return NextResponse.json({ events });
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

    console.error("Error fetching events:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch events",
        },
      },
      { status: 500 }
    );
  }
}
