import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const requestedLocale = request.nextUrl.pathname.split("/")[1];
  requestHeaders.set(
    "x-influnex-locale",
    requestedLocale === "en" ? "en" : "tr"
  );

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
