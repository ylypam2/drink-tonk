import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const producto = await prisma.producto.findUnique({
      where: { id },
    });

    if (!producto) {
      return Response.json(
        {
          success: false,
          error: "Producto no encontrado",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: producto,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return Response.json(
      {
        success: false,
        error: "Error al obtener producto",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const productoExistente = await prisma.producto.findUnique({
      where: { id },
    });

    if (!productoExistente) {
      return Response.json(
        {
          success: false,
          error: "Producto no encontrado",
        },
        { status: 404 }
      );
    }

    const { nombre, descripcion, precioVenta, costoProduccion, stock, stockMinimo, unidadMedida, estado } = body;

    const data: any = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (precioVenta !== undefined) data.precioVenta = Number(precioVenta);
    if (costoProduccion !== undefined) data.costoProduccion = Number(costoProduccion);
    if (stock !== undefined) data.stock = Number(stock);
    if (stockMinimo !== undefined) data.stockMinimo = Number(stockMinimo);
    if (unidadMedida !== undefined) data.unidadMedida = unidadMedida;
    if (estado !== undefined) data.estado = estado;

    const producto = await prisma.producto.update({
      where: { id },
      data,
    });

    return Response.json(
      {
        success: true,
        data: producto,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return Response.json(
      {
        success: false,
        error: "Error al actualizar producto",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const productoExistente = await prisma.producto.findUnique({
      where: { id },
    });

    if (!productoExistente) {
      return Response.json(
        {
          success: false,
          error: "Producto no encontrado",
        },
        { status: 404 }
      );
    }

    try {
      await prisma.producto.delete({
        where: { id },
      });

      return Response.json(
        {
          success: true,
          data: { message: "Producto eliminado correctamente" },
        },
        { status: 200 }
      );
    } catch (deleteError: any) {
      if (deleteError.code === "P2003") {
        return Response.json(
          {
            success: false,
            error: "No se puede eliminar el producto porque tiene registros asociados",
          },
          { status: 409 }
        );
      }

      throw deleteError;
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return Response.json(
      {
        success: false,
        error: "Error al eliminar producto",
      },
      { status: 500 }
    );
  }
}
