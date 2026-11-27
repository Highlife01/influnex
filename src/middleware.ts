import { NextResponse, type NextRequest } from "next/server";

const PRIMARY_CANONICAL_ORIGIN = "https://www.influnex.com.tr";

function shouldRedirectToPrimaryDomain(hostHeader: string): boolean {
  const host = (hostHeader.split(",")[0] ?? "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");

  if (!host) return false;

  return (
    host === "influnex.web.app" ||
    host === "influnex.firebaseapp.com" ||
    host === "influnex.com.tr" ||
    host.endsWith(".web.app") ||
    host.endsWith(".firebaseapp.com")
  );
}

export function middleware(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host") || "";
  const directHost = request.headers.get("host") || "";

  if (
    shouldRedirectToPrimaryDomain(forwardedHost) ||
    shouldRedirectToPrimaryDomain(directHost)
  ) {
    const destinationUrl = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      PRIMARY_CANONICAL_ORIGIN
    );
    const redirectResponse = NextResponse.redirect(destinationUrl, 301);
    redirectResponse.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    redirectResponse.headers.set("Vary", "Host, X-Forwarded-Host");
    return redirectResponse;
  }

  const requestHeaders = new Headers(request.headers);
  const requestedLocale = request.nextUrl.pathname.split("/")[1];
  requestHeaders.set(
    "x-influnex-locale",
    requestedLocale === "en" ? "en" : "tr"
  );

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Vary", "Host, X-Forwarded-Host");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
