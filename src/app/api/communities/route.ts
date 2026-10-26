import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for discovery endpoint
const communityDiscoverySchema = z.object({
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

    // Validate filters
    const validatedFilters = communityDiscoverySchema.parse(filters);

    // Build SQL query with PostGIS
    let query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.categories,
        c.type,
        c."accessType",
        ST_Y(cl.coordinates::geometry) as latitude,
        ST_X(cl.coordinates::geometry) as longitude,
        cl.area,
        COUNT(DISTINCT cm.id) as "memberCount"
    `;
    
    // Add distance calculation if user location provided
    if (validatedFilters.lat && validatedFilters.lng) {
      query += `,
        ST_Distance(
          cl.coordinates,
          ST_SetSRID(ST_MakePoint($<lng>, $<lat>), 4326)::geography
        ) / 1000 as distance
      `;
    }
    
    query += `
      FROM "Community" c
      LEFT JOIN "CommunityLocation" cl ON c.id = cl."communityId"
      LEFT JOIN "CommunityMembership" cm ON c.id = cm."communityId"
      LEFT JOIN "CommunitySubmission" cs ON c.id = cs."communityId"
      WHERE 1=1
        AND (cs.status = 'APPROVED' OR cs.status IS NULL)
    `;
    
    const params: any = {};
    
    // Add category filter
    if (validatedFilters.categories && validatedFilters.categories.length > 0) {
      query += ` AND c.categories && $<categories>`;
      params.categories = validatedFilters.categories;
    }
    
    // Add bounds filter
    if (validatedFilters.bounds) {
      query += ` AND cl.coordinates IS NOT NULL
        AND ST_Within(
          cl.coordinates::geometry,
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
        c.name ILIKE $<search> OR 
        c.description ILIKE $<search>
      )`;
      params.search = `%${validatedFilters.search}%`;
    }
    
    // Add user location params if provided
    if (validatedFilters.lat && validatedFilters.lng) {
      params.lat = validatedFilters.lat;
      params.lng = validatedFilters.lng;
    }
    
    query += `
      GROUP BY c.id, cl.coordinates, cl.area
    `;
    
    // Order by distance if available, otherwise by creation date
    if (validatedFilters.lat && validatedFilters.lng) {
      query += ` ORDER BY distance ASC NULLS LAST, c."createdAt" DESC`;
    } else {
      query += ` ORDER BY c."createdAt" DESC`;
    }
    
    query += ` LIMIT 50`;

    // Execute raw query
    const communities = await prisma.$queryRawUnsafe(query, params);

    // Convert BigInt to Number for JSON serialization
    const serializedCommunities = (communities as any[]).map(community => ({
      ...community,
      memberCount: community.memberCount ? Number(community.memberCount) : 0,
    }));

    return NextResponse.json({ communities: serializedCommunities });
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
