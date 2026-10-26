import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for event discovery endpoint
const eventDiscoverySchema = z.object({
  categories: z.array(z.string()).optional(),
  search: z.string().optional(),
  bounds: z.object({
    sw_lat: z.number(),
    sw_lng: z.number(),
    ne_lat: z.number(),
    ne_lng: z.number(),
  }).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  startDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query params
    const filters: any = {};
    
    const categories = searchParams.getAll("categories");
    if (categories.length > 0) {
      filters.categories = categories;
    }
    
    const search = searchParams.get("search");
    if (search) {
      filters.search = search;
    }
    
    // Parse bounds if provided
    const sw_lat = searchParams.get("sw_lat");
    const sw_lng = searchParams.get("sw_lng");
    const ne_lat = searchParams.get("ne_lat");
    const ne_lng = searchParams.get("ne_lng");
    
    if (sw_lat && sw_lng && ne_lat && ne_lng) {
      filters.bounds = {
        sw_lat: parseFloat(sw_lat),
        sw_lng: parseFloat(sw_lng),
        ne_lat: parseFloat(ne_lat),
        ne_lng: parseFloat(ne_lng),
      };
    }
    
    // User location for distance calculation
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) {
      filters.lat = parseFloat(lat);
      filters.lng = parseFloat(lng);
    }
    
    const startDate = searchParams.get("startDate");
    if (startDate) {
      filters.startDate = startDate;
    }

    // Validate filters
    const validatedFilters = eventDiscoverySchema.parse(filters);

    // Build SQL query with PostGIS
    let query = `
      SELECT 
        e.id,
        e.name as title,
        e.description,
        e.category,
        e."startDate",
        e."endDate",
        e."startTime",
        e.venue,
        e.area,
        e.organizer,
        e.quota,
        e.fee,
        e."externalLink",
        ST_Y(e.coordinates::geometry) as latitude,
        ST_X(e.coordinates::geometry) as longitude,
        COUNT(DISTINCT er.id) FILTER (WHERE er."cancelledAt" IS NULL) as "attendeeCount"
    `;
    
    // Add distance calculation if user location provided
    if (validatedFilters.lat && validatedFilters.lng) {
      query += `,
        ST_Distance(
          e.coordinates,
          ST_SetSRID(ST_MakePoint($<lng>, $<lat>), 4326)::geography
        ) / 1000 as distance
      `;
    }
    
    // Add community name via join
    query += `,
      (
        SELECT json_agg(c.name)
        FROM "EventCommunity" ec
        LEFT JOIN "Community" c ON ec."communityId" = c.id
        WHERE ec."eventId" = e.id
      ) as "communityNames"
    `;
    
    query += `
      FROM "Event" e
      LEFT JOIN "EventRegistration" er ON e.id = er."eventId"
      WHERE e."isPublished" = true
        AND e."startDate" >= NOW()
    `;
    
    const params: any = {};
    
    // Add category filter
    if (validatedFilters.categories && validatedFilters.categories.length > 0) {
      query += ` AND e.category = ANY($<categories>)`;
      params.categories = validatedFilters.categories;
    }
    
    // Add bounds filter
    if (validatedFilters.bounds) {
      query += ` AND e.coordinates IS NOT NULL
        AND ST_Within(
          e.coordinates::geometry,
          ST_MakeEnvelope($<sw_lng>, $<sw_lat>, $<ne_lng>, $<ne_lat>, 4326)
        )`;
      params.sw_lng = validatedFilters.bounds.sw_lng;
      params.sw_lat = validatedFilters.bounds.sw_lat;
      params.ne_lng = validatedFilters.bounds.ne_lng;
      params.ne_lat = validatedFilters.bounds.ne_lat;
    }
    
    // Add search filter
    if (validatedFilters.search) {
      query += ` AND (
        e.name ILIKE $<search> OR 
        e.description ILIKE $<search> OR
        e.organizer ILIKE $<search>
      )`;
      params.search = `%${validatedFilters.search}%`;
    }
    
    // Add startDate filter
    if (validatedFilters.startDate) {
      query += ` AND e."startDate" >= $<startDate>`;
      params.startDate = validatedFilters.startDate;
    }
    
    // Add user location params if provided
    if (validatedFilters.lat && validatedFilters.lng) {
      params.lat = validatedFilters.lat;
      params.lng = validatedFilters.lng;
    }
    
    query += `
      GROUP BY e.id
    `;
    
    // Order by distance if available, then by start date
    if (validatedFilters.lat && validatedFilters.lng) {
      query += ` ORDER BY distance ASC NULLS LAST, e."startDate" ASC`;
    } else {
      query += ` ORDER BY e."startDate" ASC`;
    }
    
    query += ` LIMIT 50`;

    // Execute raw query
    const events = await prisma.$queryRawUnsafe(query, params);

    // Convert BigInt to Number for JSON serialization
    const serializedEvents = (events as any[]).map(event => ({
      ...event,
      attendeeCount: event.attendeeCount ? Number(event.attendeeCount) : 0,
    }));

    return NextResponse.json({ events: serializedEvents });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { error: "Invalid filters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
