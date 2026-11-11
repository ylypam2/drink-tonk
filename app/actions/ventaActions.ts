"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { obtenerUsuarioSesion } from "@/lib/autorizacion";
import { normalizarRol } from "@/lib/roles";

type ItemVenta = {
  productoId: string;
  cantidad: number;
};

export type LineaVentaServidor = {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type ResultadoVenta = {
  ok: boolean;
  mensaje: string;
  ventaId?: string;
  numeroFactura?: string;
  requiereRevision?: boolean;
  resumen?: {
    subtotal: number;
    iva: number;
    total: number;
  };
  lineas?: LineaVentaServidor[];
};

const PORCENTAJE_IVA = new Prisma.Decimal("0.19");
const TOLERANCIA_IMPORTE = new Prisma.Decimal("0.5");

export type OpcionesVenta = {
  totalEsperado?: number;
  aplicarIva?: boolean;
};

export async function registrarVenta(
  items: ItemVenta[],
  clienteId: string | null,
  metodoPago: string,
  opciones: OpcionesVenta = {}
): Promise<ResultadoVenta> {
  try {
    const usuarioActual = await obtenerUsuarioSesion();

    const rol = normalizarRol(usuarioActual.rol);
    if (!rol.valido || (rol.rol !== "ADMIN" && rol.rol !== "EMPLEADO")) {
      return {
        ok: false,
        mensaje: "Solo un empleado o administrador puede registrar ventas.",
      };
    }

    const { totalEsperado, aplicarIva = true } = opciones;

    if (
      totalEsperado !== undefined &&
      (typeof totalEsperado !== "number" || !Number.isFinite(totalEsperado))
    ) {
      return {
        ok: false,
        mensaje: "El total esperado no es válido.",
      };
    }

    if (typeof aplicarIva !== "boolean") {
      return {
        ok: false,
        mensaje: "La opción de IVA no es válida.",
      };
    }

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

      const iva = aplicarIva
        ? subtotal.mul(PORCENTAJE_IVA)
        : new Prisma.Decimal(0);
      const total = subtotal.add(iva);

      if (totalEsperado !== undefined) {
        const diferencia = total
          .minus(new Prisma.Decimal(totalEsperado))
          .abs();

        if (diferencia.greaterThan(TOLERANCIA_IMPORTE)) {
          return {
            tipo: "revision" as const,
            resumen: {
              subtotal: subtotal.toNumber(),
              iva: iva.toNumber(),
              total: total.toNumber(),
            },
            lineas: detalles.map((detalle) => ({
              productoId: detalle.productoId,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario.toNumber(),
              subtotal: detalle.subtotal.toNumber(),
            })),
          };
        }
      }

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
        const actualizacion = await tx.producto.updateMany({
          where: {
            id: detalle.productoId,
            estado: true,
            stock: {
              gte: detalle.cantidad,
            },
          },
          data: {
            stock: {
              decrement: detalle.cantidad,
            },
          },
        });

        if (actualizacion.count !== 1) {
          throw new Error(
            "El stock cambió o el producto dejó de estar disponible. Actualiza la página y revisa la venta."
          );
        }

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

      return { tipo: "venta" as const, venta, numeroFactura };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

    if (resultado.tipo === "revision") {
      return {
        ok: false,
        requiereRevision: true,
        mensaje:
          "Los precios cambiaron desde que armaste el carrito. Revisa el nuevo total estimado y confirma nuevamente para registrar la venta.",
        resumen: resultado.resumen,
        lineas: resultado.lineas,
      };
    }

    revalidatePath("/ventas");
    revalidatePath("/productos");

    return {
      ok: true,
      mensaje: "Venta registrada correctamente.",
      ventaId: resultado.venta.id,
      numeroFactura: resultado.numeroFactura,
    };
  } catch (error) {
    console.error("Error al registrar venta:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return {
        ok: false,
        mensaje:
          "Otra operación modificó el inventario al mismo tiempo. Actualiza la página, revisa el stock y vuelve a intentarlo.",
      };
    }

    return {
      ok: false,
      mensaje:
        error instanceof Error
          ? error.message
          : "No fue posible registrar la venta.",
    };
  }
}
