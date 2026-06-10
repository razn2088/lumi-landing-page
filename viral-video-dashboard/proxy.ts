import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "./lib/supabase/ssr";
import { isAllowedEmail } from "./lib/auth";
import { GATE_COOKIE, gateToken, timingSafeEqual } from "./lib/gate";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function proxy(request: NextRequest) {
  // Shared-password gate (used in deployment): when DASHBOARD_PASSWORD is set it is the
  // sole auth — require a valid gate cookie or redirect to /gate. Takes precedence over
  // everything below so a deployed instance is protected by the password alone.
  const password = process.env.DASHBOARD_PASSWORD;
  if (password) {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith("/gate")) return NextResponse.next();
    const token = request.cookies.get(GATE_COOKIE)?.value ?? "";
    if (timingSafeEqual(token, await gateToken(password))) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/gate";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Local-dev convenience ONLY: skip auth when explicitly enabled (off by default;
  // never set DASHBOARD_DEV_NO_AUTH in a deployed/shared environment).
  if (process.env.DASHBOARD_DEV_NO_AUTH === "true") return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const { supabase, response } = createMiddlewareClient(request);
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!isAllowedEmail(email, process.env.ALLOWED_EMAILS)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
