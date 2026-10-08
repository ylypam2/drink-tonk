"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioSesion } from "@/lib/autorizacion";

type ItemVenta = {
  productoId: string;
  cantidad: number;
};

export type ResultadoVenta = {
  ok: boolean;
  mensaje: string;
  ventaId?: string;
};

const PORCENTAJE_IVA = new Prisma.Decimal("0.19");

export async function registrarVenta(
  items: ItemVenta[],
  clienteId: string | null,
  metodoPago: string
): Promise<ResultadoVenta> {
  try {
    const usuarioActual = await obtenerUsuarioSesion();

    if (!Array.isArray(items) || items.length === 0) {
      return {
        ok: false,
        mensaje: "Debes agregar al menos un producto a la venta.",
      };
    }

    const metodosPermitidos = ["EFECTIVO", "TARJETA", "TRANSFERENCIA"];

    if (!metodosPermitidos.includes(metodoPago)) {
      return {
        ok: false,
        mensaje: "El método de pago seleccionado no es válido.",
      };
    }

    const productosAgrupados = new Map<string, number>();

    for (const item of items) {
      const cantidad = Number(item.cantidad);

      if (!item.productoId || !Number.isInteger(cantidad) || cantidad <= 0) {
        return {
          ok: false,
          mensaje: "Cada producto debe tener una cantidad entera mayor a cero.",
        };
      }

      productosAgrupados.set(
        item.productoId,
        (productosAgrupados.get(item.productoId) ?? 0) + cantidad
      );
    }

    const itemsNormalizados = Array.from(productosAgrupados, ([productoId, cantidad]) => ({
      productoId,
      cantidad,
    }));

    if (clienteId) {
      const cliente = await prisma.cliente.findFirst({
        where: {
          id: clienteId,
          estado: true,
        },
        select: {
          id: true,
        },
      });

      if (!cliente) {
        return {
          ok: false,
          mensaje: "El cliente seleccionado no existe o se encuentra inactivo.",
        };
      }
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const idsProductos = itemsNormalizados.map((item) => item.productoId);

      const productos = await tx.producto.findMany({
        where: {
          id: {
            in: idsProductos,
          },
          estado: true,
        },
        select: {
          id: true,
          nombre: true,
          precioVenta: true,
          stock: true,
        },
      });

      if (productos.length !== idsProductos.length) {
        throw new Error(
          "Uno o varios productos no existen o no están disponibles."
        );
      }

      const productosPorId = new Map(
        productos.map((producto) => [producto.id, producto])
      );

      let subtotal = new Prisma.Decimal(0);

      const detalles = itemsNormalizados.map((item) => {
        const producto = productosPorId.get(item.productoId);

        if (!producto) {
          throw new Error("Producto no encontrado.");
        }

        if (producto.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}.` 
          );
        }

        const subtotalDetalle = producto.precioVenta.mul(item.cantidad);
        subtotal = subtotal.add(subtotalDetalle);

        return {
          productoId: producto.id,
          cantidad: item.cantidad,
          precioUnitario: producto.precioVenta,
          subtotal: subtotalDetalle,
          stockAnterior: producto.stock,
          stockNuevo: producto.stock - item.cantidad,
        };
      });

      const iva = subtotal.mul(PORCENTAJE_IVA);
      const total = subtotal.add(iva);

      const venta = await tx.venta.create({
        data: {
          usuarioId: usuarioActual.id,
          clienteId: clienteId || null,
          subtotal,
          iva,
          total,
          metodoPago,
          estado: "completada",
          detallesVenta: {
            create: detalles.map((detalle) => ({
              productoId: detalle.productoId,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
              subtotal: detalle.subtotal,
            })),
          },
        },
      });

      for (const detalle of detalles) {
        await tx.producto.update({
          where: {
            id: detalle.productoId,
          },
          data: {
            stock: detalle.stockNuevo,
          },
        });

        await tx.movimientoInventario.create({
          data: {
            productoId: detalle.productoId,
            usuarioId: usuarioActual.id,
            tipoMovimiento: "SALIDA_VENTA",
            cantidad: detalle.cantidad,
            stockAnterior: detalle.stockAnterior,
            stockNuevo: detalle.stockNuevo,
            motivo: `Venta ${venta.id}`,
          },
        });
      }

      const numeroFactura = `DT-${Date.now()}-${venta.id.slice(-6).toUpperCase()}`;

      await tx.factura.create({
        data: {
          ventaId: venta.id,
          numeroFactura,
          subtotal,
          iva,
          total,
          estado: "emitida",
        },
      });

      return venta;
    });

    revalidatePath("/ventas");
    revalidatePath("/productos");

    return {
      ok: true,
      mensaje: "Venta registrada correctamente.",
      ventaId: resultado.id,
    };
  } catch (error) {
    console.error("Error al registrar venta:", error);

    return {
      ok: false,
      mensaje:
        error instanceof Error
          ? error.message
          : "No fue posible registrar la venta.",
    };
  }
}
