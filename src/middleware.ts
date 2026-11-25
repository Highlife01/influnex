import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.influnex.com.tr",
).hostname.toLowerCase();

export function middleware(request: NextRequest) {
  const hostname = request.headers
    .get("host")
    ?.split(":")[0]
    ?.toLowerCase();
  const requestHeaders = new Headers(request.headers);
  const requestedLocale = request.nextUrl.pathname.split("/")[1];
  requestHeaders.set(
    "x-influnex-locale",
    requestedLocale === "en" ? "en" : "tr",
  );
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (hostname && hostname !== CANONICAL_HOST) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
