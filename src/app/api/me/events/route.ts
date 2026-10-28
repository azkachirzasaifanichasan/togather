import { NextRequest, NextResponse } from "next/server";
import { getAccountContext } from "@/server/auth";
import { getUserEventRegistrations } from "@/server/events";
import { errorResponse } from "@/lib/api-error";
import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["TERDAFTAR", "RIWAYAT"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAccountContext();

    if (!ctx.userId) {
      throw new Error("UNAUTHORIZED");
    }

    const raw = request.nextUrl.searchParams.get("status");
    const { status } = querySchema.parse({
      status: raw && raw.trim() !== "" ? raw.trim() : undefined,
    });

    const events = await getUserEventRegistrations(ctx.userId, status);

    return NextResponse.json({ events });
  } catch (error) {
    return errorResponse(error);
  }
}
