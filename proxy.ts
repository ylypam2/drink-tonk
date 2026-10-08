import { NextRequest, NextResponse } from "next/server";

const rutasPublicas = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const esArchivoEstatico =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".");

  const esRutaPublica = rutasPublicas.includes(pathname);

  if (esArchivoEstatico || esRutaPublica) {
    return NextResponse.next();
  }

  const session = request.cookies.get("drink_tonk_session")?.value;
  const rol = request.cookies.get("drink_tonk_role")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && rol !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth/login|api/auth/logout|_next/static|_next/image|favicon.ico).*)",
  ],
};
