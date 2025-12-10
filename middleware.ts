import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const pathname = request.nextUrl.pathname;

  if (pathname.includes("/news") && request.method === "GET") {
    // Public news API
    response.headers.set(
      "Cache-Control",
      "public, max-age=5, s-maxage=10, stale-while-revalidate=5"
    );
  } else if (pathname.includes("/auth")) {
    // Auth endpoints - no cache
    response.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate"
    );
  }

  // Page routes
  if (!pathname.startsWith("/_next") && !pathname.startsWith("/api")) {
    if (pathname === "/" || pathname.startsWith("/news/")) {
      // Public pages - short browser cache, longer edge cache
      response.headers.set(
        "Cache-Control",
        "public, max-age=10, s-maxage=30, stale-while-revalidate=60"
      );
    } else if (pathname.startsWith("/auth")) {
      // Auth pages - no cache
      response.headers.set("Cache-Control", "private, no-cache");
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
