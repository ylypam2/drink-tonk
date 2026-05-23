import { cookies } from "next/headers";

export async function obtenerSesion() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const sesion = await obtenerSesion();

  if (!sesion || sesion.rol !== "admin") {
    return null;
  }

  return sesion;
}

export async function requireEmpleadoOAdmin() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return null;
  }

  if (sesion.rol !== "admin" && sesion.rol !== "empleado") {
    return null;
  }

  return sesion;
}