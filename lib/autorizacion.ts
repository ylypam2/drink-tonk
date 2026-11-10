import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { normalizarRol } from "@/lib/roles";

enum ErrorTipo {
  SESION_INVALIDA = "SESION_INVALIDA",
  USUARIO_INACTIVO = "USUARIO_INACTIVO",
  PERMISO_DENEGADO = "PERMISO_DENEGADO",
  ROL_INVALIDO = "ROL_INVALIDO",
  ERROR_INTERNO = "ERROR_INTERNO",
}

class ErrorAutorizacion extends Error {
  tipo: ErrorTipo;

  constructor(tipo: ErrorTipo, mensaje: string) {
    super(mensaje);
    this.tipo = tipo;
    this.name = "ErrorAutorizacion";
  }
}

export async function obtenerUsuarioSesion() {
  const cookieStore = await cookies();

  const token = cookieStore.get("drink_tonk_session")?.value;

  if (!token) {
    throw new ErrorAutorizacion(ErrorTipo.SESION_INVALIDA, "Debes iniciar sesión para realizar esta acción.");
  }

  const userId = await verifyToken(token);

  if (!userId) {
    throw new ErrorAutorizacion(ErrorTipo.SESION_INVALIDA, "Sesión inválida o expirada.");
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      estado: true,
    },
  });

  if (!usuario) {
    throw new ErrorAutorizacion(ErrorTipo.SESION_INVALIDA, "La sesión no es válida.");
  }

  if (!usuario.estado) {
    throw new ErrorAutorizacion(ErrorTipo.USUARIO_INACTIVO, "El usuario está inactivo.");
  }

  const rolNormalizado = normalizarRol(usuario.rol);
  if (!rolNormalizado.valido) {
    throw new ErrorAutorizacion(ErrorTipo.ROL_INVALIDO, "Rol de usuario no reconocido.");
  }

  return usuario;
}

export async function exigirAdministrador() {
  const usuario = await obtenerUsuarioSesion();

  const rolNormalizado = normalizarRol(usuario.rol);
  if (!rolNormalizado.valido || rolNormalizado.rol !== "ADMIN") {
    throw new ErrorAutorizacion(ErrorTipo.PERMISO_DENEGADO, "No tienes permisos para realizar tareas administrativas.");
  }

  return usuario;
}

export { ErrorTipo, ErrorAutorizacion };
