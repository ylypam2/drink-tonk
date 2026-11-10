import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { obtenerUsuarioSesion, exigirAdministrador, ErrorTipo, ErrorAutorizacion } from "@/lib/autorizacion";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuario = await obtenerUsuarioSesion().catch(() => null);

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

    if (!usuario || usuario.rol !== "ADMIN") {
      if (!producto.estado) {
        return Response.json(
          {
            success: false,
            error: "Producto no encontrado",
          },
          { status: 404 }
        );
      }
    }

    const data = usuario?.rol === "ADMIN" ? producto : {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precioVenta: producto.precioVenta,
      stock: producto.stock,
      unidadMedida: producto.unidadMedida,
      estado: producto.estado,
      createdAt: producto.createdAt,
      updatedAt: producto.updatedAt,
    };

    return Response.json(
      {
        success: true,
        data,
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
    await exigirAdministrador();

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
    
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        return Response.json(
          {
            success: false,
            error: "El nombre no puede estar vacío",
          },
          { status: 400 }
        );
      }
      data.nombre = nombre.trim();
    }
    
    if (descripcion !== undefined) {
      if (typeof descripcion !== 'string') {
        return Response.json(
          {
            success: false,
            error: "La descripción debe ser un texto",
          },
          { status: 400 }
        );
      }
      data.descripcion = descripcion.trim();
    }
    
    if (precioVenta !== undefined) {
      const precioVentaNum = Number(precioVenta);
      if (isNaN(precioVentaNum) || precioVentaNum < 0) {
        return Response.json(
          {
            success: false,
            error: "El precio de venta debe ser un número válido y no negativo",
          },
          { status: 400 }
        );
      }
      data.precioVenta = precioVentaNum;
    }
    
    if (costoProduccion !== undefined) {
      const costoProduccionNum = Number(costoProduccion);
      if (isNaN(costoProduccionNum) || costoProduccionNum < 0) {
        return Response.json(
          {
            success: false,
            error: "El costo de producción debe ser un número válido y no negativo",
          },
          { status: 400 }
        );
      }
      data.costoProduccion = costoProduccionNum;
    }
    
    if (stock !== undefined) {
      return Response.json(
        {
          success: false,
          error: "Los cambios de stock deben registrarse mediante un movimiento de inventario",
        },
        { status: 400 }
      );
    }
    
    if (stockMinimo !== undefined) {
      const stockMinimoNum = Number(stockMinimo);
      if (isNaN(stockMinimoNum) || stockMinimoNum < 0 || !Number.isInteger(stockMinimoNum)) {
        return Response.json(
          {
            success: false,
            error: "El stock mínimo debe ser un entero no negativo",
          },
          { status: 400 }
        );
      }
      data.stockMinimo = stockMinimoNum;
    }
    
    if (unidadMedida !== undefined) {
      if (typeof unidadMedida !== 'string') {
        return Response.json(
          {
            success: false,
            error: "La unidad de medida debe ser un texto",
          },
          { status: 400 }
        );
      }
      data.unidadMedida = unidadMedida;
    }
    
    if (estado !== undefined) {
      if (typeof estado !== 'boolean') {
        return Response.json(
          {
            success: false,
            error: "El estado debe ser un valor booleano",
          },
          { status: 400 }
        );
      }
      data.estado = estado;
    }

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
    if (error instanceof ErrorAutorizacion) {
      if (error.tipo === ErrorTipo.SESION_INVALIDA || error.tipo === ErrorTipo.USUARIO_INACTIVO) {
        return Response.json(
          { success: false, error: "No autenticado" },
          { status: 401 }
        );
      }
      if (error.tipo === ErrorTipo.PERMISO_DENEGADO || error.tipo === ErrorTipo.ROL_INVALIDO) {
        return Response.json(
          { success: false, error: "No autorizado" },
          { status: 403 }
        );
      }
    }
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
    await exigirAdministrador();

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
    if (error instanceof ErrorAutorizacion) {
      if (error.tipo === ErrorTipo.SESION_INVALIDA || error.tipo === ErrorTipo.USUARIO_INACTIVO) {
        return Response.json(
          { success: false, error: "No autenticado" },
          { status: 401 }
        );
      }
      if (error.tipo === ErrorTipo.PERMISO_DENEGADO || error.tipo === ErrorTipo.ROL_INVALIDO) {
        return Response.json(
          { success: false, error: "No autorizado" },
          { status: 403 }
        );
      }
    }
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
