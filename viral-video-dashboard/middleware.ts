import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "./lib/supabase/ssr.js";
import { isAllowedEmail } from "./lib/auth.js";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function middleware(request: NextRequest) {
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
