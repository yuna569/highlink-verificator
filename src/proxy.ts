import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login"];
const COOKIE_NAME = "session";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing env: JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let authenticated = false;

  if (token) {
    try {
      await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
      authenticated = true;
    } catch {
      // invalid or expired token
    }
  }

  // Authenticated user visiting /login → redirect to dashboard
  if (isPublic && authenticated) {
    return NextResponse.redirect(
      new URL("/pending-influencers", request.url),
    );
  }

  // Unauthenticated user visiting protected route → redirect to login
  if (!isPublic && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
