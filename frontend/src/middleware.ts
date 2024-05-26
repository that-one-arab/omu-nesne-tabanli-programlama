import { validateToken } from "@/util/api";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const currentUrl = new URL(request.url);
  const dashboardUrl = new URL("/", request.url);

  const isPublicRoute =
    currentUrl.pathname === "/login" || currentUrl.pathname === "/signup";

  // Redirect to login page if there is no token and the route is not public
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(
      new URL(
        `/login?sessionExpired=true&redirectTo=${request.nextUrl.pathname}`,
        request.url
      )
    );
  }
  // Validate token if it exists and the route is public to redirect to the home page
  if (token && isPublicRoute) {
    const isValid = await validateToken(token);
    if (isValid) {
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.redirect(
      new URL(
        `/login?sessionExpired=true&redirectTo=${request.nextUrl.pathname}`,
        request.url
      )
    );
  }

  if (token && !isPublicRoute) {
    const isValid = await validateToken(token);
    if (!isValid) {
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
