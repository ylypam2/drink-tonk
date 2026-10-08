"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function crearProducto(formData: FormData) {
  const nombre = formData.get("nombre")?.toString().trim() || "";
  const precioVenta = Number(formData.get("precioVenta"));
  const costoProduccion = Number(formData.get("costoProduccion")) || 0;
  const stock = Number(formData.get("stock"));
  const stockMinimo = Number(formData.get("stockMinimo")) || 10;
  const unidadMedida = formData.get("unidadMedida")?.toString() || "unidad";
  const descripcion = formData.get("descripcion")?.toString().trim() || "";

  if (!nombre) throw new Error("El nombre es obligatorio");
  if (isNaN(precioVenta) || precioVenta < 0) throw new Error("Precio de venta inválido");
  if (isNaN(stock) || stock < 0) throw new Error("Stock inválido");

  await prisma.producto.create({
    data: {
      nombre,
      descripcion,
      precioVenta,
      costoProduccion,
      stock,
      stockMinimo,
      unidadMedida,
      estado: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/productos");
}

export async function actualizarProducto(formData: FormData) {
  const id = formData.get("id")?.toString();
  const nombre = formData.get("nombre")?.toString().trim() || "";
  const precioVenta = Number(formData.get("precioVenta"));
  const costoProduccion = Number(formData.get("costoProduccion")) || 0;
  const stock = Number(formData.get("stock"));
  const stockMinimo = Number(formData.get("stockMinimo")) || 10;
  const unidadMedida = formData.get("unidadMedida")?.toString() || "unidad";
  const descripcion = formData.get("descripcion")?.toString().trim() || "";

  if (!id) throw new Error("ID no válido");
  if (!nombre) throw new Error("El nombre es obligatorio");
  if (isNaN(precioVenta) || precioVenta < 0) throw new Error("Precio de venta inválido");
  if (isNaN(stock) || stock < 0) throw new Error("Stock inválido");

  await prisma.producto.update({
    where: { id },
    data: {
      nombre,
      descripcion,
      precioVenta,
      costoProduccion,
      stock,
      stockMinimo,
      unidadMedida,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/productos");
}

export async function eliminarProducto(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("ID no válido");
  }

  await prisma.producto.delete({
    where: { id }
  });

  revalidatePath("/admin");
  revalidatePath("/productos");
}