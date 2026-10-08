"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function loginUsuario(formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString().trim() || "";

  if (!email || !password) {
    throw new Error("Correo y contraseña son obligatorios");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email }
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  if (!usuario.estado) {
    throw new Error("Usuario inactivo");
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);

  if (!passwordValida) {
    throw new Error("Contraseña incorrecta");
  }

  const cookieStore = await cookies();

  cookieStore.set("session", JSON.stringify({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  }), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  if (usuario.rol === "ADMIN") {
    redirect("/admin");
  }

  redirect("/empleado");
}

export async function logoutUsuario() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}