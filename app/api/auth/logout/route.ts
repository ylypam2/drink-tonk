import { NextResponse } from "next/server";

export async function POST() {
  const respuesta = NextResponse.json({
    success: true,
    mensaje: "Sesión cerrada correctamente.",
  });

  respuesta.cookies.delete({ name: "drink_tonk_session", path: "/" });
  respuesta.cookies.delete({ name: "drink_tonk_role", path: "/" });
  respuesta.cookies.delete({ name: "session", path: "/" });

  return respuesta;
}
