import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const rutasPublicas = ["/login"];
const rutasPublicasAPI = ["/api/productos", "/api/productos/", "/api/auth/me"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const esArchivoEstatico =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".");

  const esRutaPublica = rutasPublicas.includes(pathname);

  if (esArchivoEstatico || esRutaPublica) {
    return NextResponse.next();
  }

  const esRutaPublicaAPI = rutasPublicasAPI.some(ruta => pathname.startsWith(ruta));
  const esAPI = pathname.startsWith("/api/");

  if (esAPI && esRutaPublicaAPI && (request.method === "GET" || pathname.match(/^\/api\/productos\/[^/]+$/))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("drink_tonk_session")?.value;

  if (!token) {
    if (esAPI) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userId = await verifyToken(token);

  if (!userId) {
    const response = esAPI
      ? NextResponse.json({ success: false, error: "Sesión inválida o expirada" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete({ name: "drink_tonk_session", path: "/" });
    response.cookies.delete({ name: "drink_tonk_role", path: "/" });
    response.cookies.delete({ name: "session", path: "/" });
    return response;
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth/login|api/auth/logout|_next/static|_next/image|favicon.ico).*)",
  ],
};
