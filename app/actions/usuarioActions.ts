"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { exigirAdministrador } from "@/lib/autorizacion";

export type ResultadoAccion = {
  ok: boolean;
  mensaje: string;
};

export async function crearUsuario(
  _estadoAnterior: ResultadoAccion,
  formData: FormData
): Promise<ResultadoAccion> {
  try {
    await exigirAdministrador();

    const nombre = formData.get("nombre")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim().toLowerCase() || "";
    const password = formData.get("password")?.toString() || "";
    const rol = formData.get("rol")?.toString().toUpperCase() || "EMPLEADO";

    if (!nombre) return { ok: false, mensaje: "El nombre es obligatorio." };
    if (!email) return { ok: false, mensaje: "El correo es obligatorio." };

    if (password.length < 6) {
      return {
        ok: false,
        mensaje: "La contraseña debe tener mínimo 6 caracteres.",
      };
    }

    if (!["ADMIN", "EMPLEADO"].includes(rol)) {
      return { ok: false, mensaje: "El rol seleccionado no es válido." };
    }

    const existente = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existente) {
      return {
        ok: false,
        mensaje: "Ya existe un usuario con ese correo.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol,
        estado: true,
      },
    });

    revalidatePath("/admin/usuarios");
    return { ok: true, mensaje: "Usuario creado correctamente." };
  } catch (error) {
    console.error("Error al crear usuario:", error);

    return {
      ok: false,
      mensaje:
        error instanceof Error && error.message.includes("permisos")
          ? error.message
          : "No fue posible crear el usuario.",
    };
  }
}

export async function cambiarEstadoUsuario(
  usuarioId: string,
  nuevoEstado: boolean
): Promise<ResultadoAccion> {
  try {
    const administradorActual = await exigirAdministrador();

    if (usuarioId === administradorActual.id && !nuevoEstado) {
      return {
        ok: false,
        mensaje: "No puedes desactivar tu propia cuenta.",
      };
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true },
    });

    if (!usuario) {
      return { ok: false, mensaje: "No se encontró el usuario." };
    }

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { estado: nuevoEstado },
    });

    revalidatePath("/admin/usuarios");
    return {
      ok: true,
      mensaje: nuevoEstado
        ? "Usuario activado correctamente."
        : "Usuario desactivado correctamente.",
    };
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return {
      ok: false,
      mensaje: "No fue posible cambiar el estado del usuario.",
    };
  }
}

export async function cambiarRolUsuario(
  usuarioId: string,
  nuevoRol: string
): Promise<ResultadoAccion> {
  try {
    const administradorActual = await exigirAdministrador();
    const rolNormalizado = nuevoRol.toUpperCase();

    if (!["ADMIN", "EMPLEADO"].includes(rolNormalizado)) {
      return { ok: false, mensaje: "El rol seleccionado no es válido." };
    }

    if (usuarioId === administradorActual.id && rolNormalizado !== "ADMIN") {
      return {
        ok: false,
        mensaje: "No puedes cambiar tu propio rol de administrador.",
      };
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true },
    });

    if (!usuario) {
      return { ok: false, mensaje: "No se encontró el usuario." };
    }

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { rol: rolNormalizado },
    });

    revalidatePath("/admin/usuarios");
    return { ok: true, mensaje: "Rol actualizado correctamente." };
  } catch (error) {
    console.error("Error al cambiar rol:", error);
    return {
      ok: false,
      mensaje: "No fue posible cambiar el rol del usuario.",
    };
  }
}

export async function eliminarUsuario(
  usuarioId: string
): Promise<ResultadoAccion> {
  try {
    const administradorActual = await exigirAdministrador();

    if (!usuarioId) {
      return {
        ok: false,
        mensaje: "No se recibió el identificador del usuario.",
      };
    }

    if (usuarioId === administradorActual.id) {
      return {
        ok: false,
        mensaje: "No puedes eliminar tu propia cuenta.",
      };
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        _count: {
          select: {
            ventas: true,
            movimientosInventario: true,
            comprasInsumo: true,
          },
        },
      },
    });

    if (!usuario) {
      return { ok: false, mensaje: "No se encontró el usuario." };
    }

    const tieneOperaciones =
      usuario._count.ventas > 0 ||
      usuario._count.movimientosInventario > 0 ||
      usuario._count.comprasInsumo > 0;

    if (tieneOperaciones) {
      return {
        ok: false,
        mensaje:
          "No se puede eliminar este perfil porque tiene operaciones registradas. Desactívalo para conservar el historial.",
      };
    }

    await prisma.usuario.delete({
      where: { id: usuarioId },
    });

    revalidatePath("/admin/usuarios");
    return { ok: true, mensaje: "Usuario eliminado correctamente." };
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return {
      ok: false,
      mensaje: "No fue posible eliminar el usuario.",
    };
  }
}