import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  // Allow all requests to pass through
  // Authorization checks happen in route handlers and server components
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
