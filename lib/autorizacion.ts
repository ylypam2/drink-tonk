import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function obtenerUsuarioSesion() {
  const cookieStore = await cookies();

  const usuarioId = cookieStore.get("drink_tonk_session")?.value;

  if (!usuarioId) {
    throw new Error("Debes iniciar sesión para realizar esta acción.");
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      estado: true,
    },
  });

  if (!usuario || !usuario.estado) {
    throw new Error("La sesión no es válida o el usuario está inactivo.");
  }

  return usuario;
}

export async function exigirAdministrador() {
  const usuario = await obtenerUsuarioSesion();

  if (usuario.rol !== "ADMIN") {
    throw new Error(
      "No tienes permisos para realizar tareas administrativas."
    );
  }

  return usuario;
}
