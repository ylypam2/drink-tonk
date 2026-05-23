"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Usuario from "@/models/Usuario";

export async function loginUsuario(formData: FormData) {
  await dbConnect();

  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString().trim() || "";

  if (!email || !password) {
    throw new Error("Correo y contraseña son obligatorios");
  }

  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  if (!usuario.estado) {
    throw new Error("Usuario inactivo");
  }

  const passwordValida = await usuario.compararPassword(password);

  if (!passwordValida) {
    throw new Error("Contraseña incorrecta");
  }

  const cookieStore = await cookies();

  cookieStore.set("session", JSON.stringify({
    id: usuario._id.toString(),
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

  if (usuario.rol === "admin") {
    redirect("/admin");
  }

  redirect("/empleado");
}

export async function logoutUsuario() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}