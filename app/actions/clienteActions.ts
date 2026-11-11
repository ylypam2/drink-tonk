"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioSesion } from "@/lib/autorizacion";
import { normalizarRol } from "@/lib/roles";

export type ClienteCreado = {
  id: string;
  nombre: string;
  identificacion: string;
};

export async function crearCliente(
  formData: FormData
): Promise<ClienteCreado> {
  const usuario = await obtenerUsuarioSesion();

  const rol = normalizarRol(usuario.rol);
  if (!rol.valido || (rol.rol !== "ADMIN" && rol.rol !== "EMPLEADO")) {
    throw new Error("No tienes permisos para crear clientes.");
  }

  const nombre = formData.get("nombre")?.toString().trim() ?? "";
  const identificacion =
    formData.get("identificacion")?.toString().trim() ?? "";
  const telefono = formData.get("telefono")?.toString().trim() || null;
  const email = formData.get("email")?.toString().trim() || null;
  const direccion = formData.get("direccion")?.toString().trim() || null;

  if (!nombre) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!identificacion) {
    throw new Error("La identificación es obligatoria.");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("El correo electrónico no tiene un formato válido.");
  }

  try {
    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        identificacion,
        telefono,
        email,
        direccion,
      },
      select: {
        id: true,
        nombre: true,
        identificacion: true,
      },
    });

    revalidatePath("/ventas");
    return cliente;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error(
        "Ya existe un cliente con esa identificación. Verifica los datos e inténtalo de nuevo."
      );
    }

    throw error;
  }
}
