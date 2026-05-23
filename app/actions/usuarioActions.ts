"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Usuario from "@/models/Usuario";

export async function crearUsuario(formData: FormData) {
  await dbConnect();

  const nombre = formData.get("nombre")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString().trim() || "";
  const rol = formData.get("rol")?.toString() || "empleado";

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  if (!email) {
    throw new Error("El correo es obligatorio");
  }

  if (!password || password.length < 6) {
    throw new Error("La contraseña debe tener mínimo 6 caracteres");
  }

  if (!["admin", "empleado"].includes(rol)) {
    throw new Error("Rol no válido");
  }

  const usuarioExistente = await Usuario.findOne({ email });

  if (usuarioExistente) {
    throw new Error("Ya existe un usuario con ese correo");
  }

  await Usuario.create({
    nombre,
    email,
    password,
    rol,
    estado: true,
  });

  revalidatePath("/admin/usuarios");
}