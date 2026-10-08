import { NextResponse } from "next/server";

export async function POST() {
  const respuesta = NextResponse.json({
    success: true,
    mensaje: "Sesión cerrada correctamente.",
  });

  respuesta.cookies.delete("drink_tonk_session");
  respuesta.cookies.delete("drink_tonk_role");

  return respuesta;
}
