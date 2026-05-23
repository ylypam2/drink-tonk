"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Producto from "@/models/Producto";

export async function crearProducto(formData: FormData) {
  await dbConnect();

  const nombre = formData.get("nombre")?.toString().trim() || "";
  const precio = Number(formData.get("precio"));
  const stock = Number(formData.get("stock"));
  const categoria = formData.get("categoria")?.toString().trim() || "General";
  const imagen = formData.get("imagen")?.toString().trim() || "";

  if (!nombre) throw new Error("El nombre es obligatorio");
  if (isNaN(precio) || precio < 0) throw new Error("Precio inválido");
  if (isNaN(stock) || stock < 0) throw new Error("Stock inválido");

  await Producto.create({
    nombre,
    precio,
    stock,
    categoria,
    imagen,
    disponible: stock > 0,
  });

  revalidatePath("/admin");
}

export async function actualizarProducto(formData: FormData) {
  await dbConnect();

  const id = formData.get("id")?.toString();
  const nombre = formData.get("nombre")?.toString().trim() || "";
  const precio = Number(formData.get("precio"));
  const stock = Number(formData.get("stock"));
  const categoria = formData.get("categoria")?.toString().trim() || "General";
  const imagen = formData.get("imagen")?.toString().trim() || "";

  if (!id) throw new Error("ID no válido");
  if (!nombre) throw new Error("El nombre es obligatorio");
  if (isNaN(precio) || precio < 0) throw new Error("Precio inválido");
  if (isNaN(stock) || stock < 0) throw new Error("Stock inválido");

  await Producto.findByIdAndUpdate(id, {
    nombre,
    precio,
    stock,
    categoria,
    imagen,
    disponible: stock > 0,
  });

  revalidatePath("/admin");
}

export async function eliminarProducto(formData: FormData) {
  await dbConnect();

  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("ID no válido");
  }

  await Producto.findByIdAndDelete(id);

  revalidatePath("/admin");
}