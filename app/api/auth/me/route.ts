import { NextResponse } from "next/server";
import { obtenerUsuarioSesion, ErrorTipo, ErrorAutorizacion } from "@/lib/autorizacion";
import { normalizarRol } from "@/lib/roles";

export async function GET() {
  try {
    const usuario = await obtenerUsuarioSesion();

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const rolNormalizado = normalizarRol(usuario.rol);
    if (!rolNormalizado.valido) {
      return NextResponse.json(
        { success: false, error: "Rol no reconocido" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: rolNormalizado.rol,
      },
    });
  } catch (error) {
    if (error instanceof ErrorAutorizacion) {
      if (error.tipo === ErrorTipo.SESION_INVALIDA || error.tipo === ErrorTipo.USUARIO_INACTIVO) {
        return NextResponse.json(
          { success: false, error: "No autenticado" },
          { status: 401 }
        );
      }
      if (error.tipo === ErrorTipo.PERMISO_DENEGADO || error.tipo === ErrorTipo.ROL_INVALIDO) {
        return NextResponse.json(
          { success: false, error: "No autorizado" },
          { status: 403 }
        );
      }
    }
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
