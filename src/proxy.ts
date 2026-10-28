import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Kept as a pass-through on purpose: authorization lives in route handlers and
// server components (PRD 7.6 requires server-side checks, not just hidden UI).
export default auth((req: NextRequest) => {
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
