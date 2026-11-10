import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { normalizarRol } from "@/lib/roles";

async function obtenerUsuarioDesdeToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("drink_tonk_session")?.value;

  if (!token) return null;

  const userId = await verifyToken(token);
  if (!userId) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      estado: true,
    },
  });

  if (!usuario || !usuario.estado) return null;

  const rolNormalizado = normalizarRol(usuario.rol);
  if (!rolNormalizado.valido) return null;

  return usuario;
}

export async function obtenerSesion() {
  const usuario = await obtenerUsuarioDesdeToken();
  if (!usuario) return null;

  const rolNormalizado = normalizarRol(usuario.rol);
  if (!rolNormalizado.valido) return null;

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: rolNormalizado.rol,
  };
}

export async function requireAdmin() {
  const usuario = await obtenerUsuarioDesdeToken();

  if (!usuario) return null;

  const rolNormalizado = normalizarRol(usuario.rol);
  if (!rolNormalizado.valido || rolNormalizado.rol !== "ADMIN") {
    return null;
  }

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: rolNormalizado.rol,
  };
}

export async function requireEmpleadoOAdmin() {
  const usuario = await obtenerUsuarioDesdeToken();

  if (!usuario) {
    return null;
  }

  const rolNormalizado = normalizarRol(usuario.rol);
  if (!rolNormalizado.valido) return null;

  if (rolNormalizado.rol !== "ADMIN" && rolNormalizado.rol !== "EMPLEADO") {
    return null;
  }

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: rolNormalizado.rol,
  };
}