import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = new Set(["/", "/login", "/register"]);

function roleFromJwt(token: string): string | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (b64.length % 4)) % 4;
    const padded = b64 + "=".repeat(padLen);
    const json = JSON.parse(atob(padded)) as { role?: string };
    return json.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  if (publicPaths.has(path)) {
    if (token && (path === "/login" || path === "/register")) {
      const role = roleFromJwt(token);
      if (role === "employer") {
        return NextResponse.redirect(
          new URL("/employer/dashboard", request.nextUrl)
        );
      }
      if (role === "candidate") {
        return NextResponse.redirect(
          new URL("/candidate/dashboard", request.nextUrl)
        );
      }
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    return NextResponse.next();
  }

  if (!token) {
    const login = new URL("/login", request.nextUrl);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  const role = roleFromJwt(token);
  if (path.startsWith("/employer") && role !== "employer") {
    return NextResponse.redirect(
      new URL("/candidate/dashboard", request.nextUrl)
    );
  }
  if (
    (path.startsWith("/candidate") || path.startsWith("/interview")) &&
    role !== "candidate"
  ) {
    return NextResponse.redirect(
      new URL("/employer/dashboard", request.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/employer/:path*",
    "/candidate/:path*",
    "/interview/:path*",
  ],
};
