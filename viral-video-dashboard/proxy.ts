import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "./lib/supabase/ssr";
import { isAllowedEmail } from "./lib/auth";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function proxy(request: NextRequest) {
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
