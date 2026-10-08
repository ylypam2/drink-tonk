import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "El correo electrónico y la contraseña son obligatorios.",
        },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.estado) {
      return NextResponse.json(
        {
          success: false,
          error: "El correo o la contraseña no son válidos.",
        },
        { status: 401 }
      );
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordValida) {
      return NextResponse.json(
        {
          success: false,
          error: "El correo o la contraseña no son válidos.",
        },
        { status: 401 }
      );
    }

    const respuesta = NextResponse.json(
      {
        success: true,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      },
      { status: 200 }
    );

    respuesta.cookies.set("drink_tonk_session", usuario.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    respuesta.cookies.set("drink_tonk_role", usuario.rol, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return respuesta;
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);

    return NextResponse.json(
      {
        success: false,
        error: "No fue posible procesar el inicio de sesión.",
      },
      { status: 500 }
    );
  }
}
