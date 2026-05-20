import { NextRequest, NextResponse } from "next/server";

const APP_MODE_COOKIE = "app_mode";
const ANDROID_APP_MODE = "android";

export function middleware(request: NextRequest) {
  if (request.nextUrl.searchParams.get("app") !== ANDROID_APP_MODE) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  const existingCookie = requestHeaders.get("cookie");
  const appModeCookie = `${APP_MODE_COOKIE}=${ANDROID_APP_MODE}`;

  requestHeaders.set(
    "cookie",
    existingCookie ? `${existingCookie}; ${appModeCookie}` : appModeCookie,
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(APP_MODE_COOKIE, ANDROID_APP_MODE, {
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
