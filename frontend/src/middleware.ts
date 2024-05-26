import { validateToken } from "@/util/api";
import { NextRequest, NextResponse } from "next/server";
import Cookies from "universal-cookie";

export async function middleware(request: NextRequest) {
  const cookies = new Cookies(null, { path: "/" });

  const token = request.cookies.get("token")?.value;
  const currentUrl = new URL(request.url);
  const dashboardUrl = new URL("/", request.url);

  const isPublicRoute =
    currentUrl.pathname === "/login" || currentUrl.pathname === "/signup";

  if (token && isPublicRoute) {
    const isValid = await validateToken(token);
    if (!isValid) {
      cookies.remove("token");
      return;
    }

    return NextResponse.redirect(dashboardUrl);
  }

  if (!isPublicRoute) {
    if (!token) {
      return NextResponse.redirect(
        new URL(
          `/login?sessionExpired=true&redirectTo=${request.nextUrl.pathname}`,
          request.url
        )
      );
    }

    const isValid = await validateToken(token);
    if (!isValid) {
      cookies.remove("token");
      return NextResponse.redirect(
        new URL(
          `/login?sessionExpired=true&redirectTo=${request.nextUrl.pathname}`,
          request.url
        )
      );
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/", // Explicitly include the index page
  ],
};
