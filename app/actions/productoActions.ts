"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirAdministrador } from "@/lib/autorizacion";

export async function crearProducto(formData: FormData) {
  await exigirAdministrador();
  const nombre = formData.get("nombre")?.toString().trim() || "";
  const precioVenta = formData.get("precioVenta");
  const costoProduccion = formData.get("costoProduccion");
  const stock = formData.get("stock");
  const stockMinimo = formData.get("stockMinimo");
  const unidadMedida = formData.get("unidadMedida")?.toString() || "unidad";
  const descripcion = formData.get("descripcion")?.toString().trim() || "";

  if (!nombre || nombre === "") throw new Error("El nombre es obligatorio y no puede estar vacío");
  
  const precioVentaNum = precioVenta ? Number(precioVenta) : NaN;
  if (isNaN(precioVentaNum) || precioVentaNum < 0) throw new Error("El precio de venta debe ser un número válido y no negativo");
  
  const costoProduccionNum = costoProduccion ? Number(costoProduccion) : 0;
  if (isNaN(costoProduccionNum) || costoProduccionNum < 0) throw new Error("El costo de producción debe ser un número válido y no negativo");
  
  const stockNum = stock !== null && stock !== undefined ? Number(stock) : 0;
  if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) throw new Error("El stock debe ser un entero no negativo");
  
  const stockMinimoNum = stockMinimo !== null && stockMinimo !== undefined ? Number(stockMinimo) : 10;
  if (isNaN(stockMinimoNum) || stockMinimoNum < 0 || !Number.isInteger(stockMinimoNum)) throw new Error("El stock mínimo debe ser un entero no negativo");

  await prisma.producto.create({
    data: {
      nombre,
      descripcion,
      precioVenta: precioVentaNum,
      costoProduccion: costoProduccionNum,
      stock: stockNum,
      stockMinimo: stockMinimoNum,
      unidadMedida,
      estado: true,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/productos");
}

export async function actualizarProducto(formData: FormData) {
  await exigirAdministrador();

  const id = formData.get("id")?.toString();
  const nombre = formData.get("nombre")?.toString().trim() || "";
  const precioVenta = formData.get("precioVenta");
  const costoProduccion = formData.get("costoProduccion");
  const stockMinimo = formData.get("stockMinimo");
  const unidadMedida = formData.get("unidadMedida")?.toString() || "unidad";
  const descripcion = formData.get("descripcion")?.toString().trim() || "";

  if (!id) throw new Error("ID no válido");
  if (!nombre || nombre === "") throw new Error("El nombre es obligatorio y no puede estar vacío");

  const precioVentaNum = precioVenta ? Number(precioVenta) : NaN;
  if (isNaN(precioVentaNum) || precioVentaNum < 0) throw new Error("El precio de venta debe ser un número válido y no negativo");

  const costoProduccionNum = costoProduccion ? Number(costoProduccion) : 0;
  if (isNaN(costoProduccionNum) || costoProduccionNum < 0) throw new Error("El costo de producción debe ser un número válido y no negativo");

  const stockMinimoNum = stockMinimo !== null && stockMinimo !== undefined ? Number(stockMinimo) : 10;
  if (isNaN(stockMinimoNum) || stockMinimoNum < 0 || !Number.isInteger(stockMinimoNum)) throw new Error("El stock mínimo debe ser un entero no negativo");

  const productoExistente = await prisma.producto.findUnique({
    where: { id },
  });

  if (!productoExistente) {
    throw new Error("Producto no encontrado");
  }

  await prisma.producto.update({
    where: { id },
    data: {
      nombre,
      descripcion,
      precioVenta: precioVentaNum,
      costoProduccion: costoProduccionNum,
      stockMinimo: stockMinimoNum,
      unidadMedida,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/productos");
}

export async function eliminarProducto(formData: FormData) {
  await exigirAdministrador();

  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("ID no válido");
  }

  const productoExistente = await prisma.producto.findUnique({
    where: { id },
  });

  if (!productoExistente) {
    throw new Error("Producto no encontrado");
  }

  await prisma.producto.delete({
    where: { id }
  });

  revalidatePath("/admin");
  revalidatePath("/productos");
}

export async function toggleEstadoProducto(formData: FormData) {
  await exigirAdministrador();

  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("ID no válido");
  }

  const productoExistente = await prisma.producto.findUnique({
    where: { id },
  });

  if (!productoExistente) {
    throw new Error("Producto no encontrado");
  }

  await prisma.producto.update({
    where: { id },
    data: {
      estado: !productoExistente.estado,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/productos");
}