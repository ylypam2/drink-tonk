import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { obtenerUsuarioSesion, exigirAdministrador, ErrorTipo, ErrorAutorizacion } from "@/lib/autorizacion";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderBy = searchParams.get("orderBy") || "nombre";
    const orderDirection = searchParams.get("orderDirection") || "asc";
    const search = searchParams.get("search") || "";
    const usuario = await obtenerUsuarioSesion().catch(() => null);

    const validOrderFields = ['nombre', 'precioVenta', 'stock', 'createdAt', 'estado'];
    if (!validOrderFields.includes(orderBy)) {
      return Response.json(
        {
          success: false,
          error: "Campo de ordenamiento inválido",
        },
        { status: 400 }
      );
    }

    if (orderDirection !== 'asc' && orderDirection !== 'desc') {
      return Response.json(
        {
          success: false,
          error: "Dirección de ordenamiento inválido",
        },
        { status: 400 }
      );
    }

    const where: any = search ? {
      nombre: {
        contains: search,
        mode: 'insensitive' as const,
      },
    } : {};

    if (!usuario || usuario.rol !== "ADMIN") {
      where.estado = true;
    }

    const productos = await prisma.producto.findMany({
      where,
      orderBy: {
        [orderBy]: orderDirection,
      },
      select: usuario?.rol === "ADMIN" ? undefined : {
        id: true,
        nombre: true,
        descripcion: true,
        precioVenta: true,
        stock: true,
        unidadMedida: true,
        imagenUrl: true,
        estado: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(
      {
        success: true,
        data: productos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return Response.json(
      {
        success: false,
        error: "Error al obtener productos",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await exigirAdministrador();

    const body = await request.json();

    const { nombre, descripcion, precioVenta, costoProduccion, stock, stockMinimo, unidadMedida, estado } = body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return Response.json(
        {
          success: false,
          error: "El campo nombre es obligatorio y no puede estar vacío",
        },
        { status: 400 }
      );
    }

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

    const costoProduccionNum = costoProduccion !== undefined ? Number(costoProduccion) : 0;
    if (isNaN(costoProduccionNum) || costoProduccionNum < 0) {
      return Response.json(
        {
          success: false,
          error: "El costo de producción debe ser un número válido y no negativo",
        },
        { status: 400 }
      );
    }

    const stockNum = stock !== undefined ? Number(stock) : 0;
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      return Response.json(
        {
          success: false,
          error: "El stock debe ser un entero no negativo",
        },
        { status: 400 }
      );
    }

    const stockMinimoNum = stockMinimo !== undefined ? Number(stockMinimo) : 10;
    if (isNaN(stockMinimoNum) || stockMinimoNum < 0 || !Number.isInteger(stockMinimoNum)) {
      return Response.json(
        {
          success: false,
          error: "El stock mínimo debe ser un entero no negativo",
        },
        { status: 400 }
      );
    }

    if (estado !== undefined && typeof estado !== 'boolean') {
      return Response.json(
        {
          success: false,
          error: "El campo estado debe ser un valor booleano",
        },
        { status: 400 }
      );
    }

    const data: any = {
      nombre: nombre.trim(),
      precioVenta: precioVentaNum,
      costoProduccion: costoProduccionNum,
      stock: stockNum,
      stockMinimo: stockMinimoNum,
      unidadMedida: unidadMedida || "unidad",
      estado: estado !== undefined ? estado : true,
    };

    if (descripcion !== undefined && typeof descripcion === 'string') {
      data.descripcion = descripcion.trim();
    }

    const producto = await prisma.producto.create({
      data,
    });

    return Response.json(
      {
        success: true,
        data: producto,
      },
      { status: 201 }
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
    console.error("Error al crear producto:", error);
    return Response.json(
      {
        success: false,
        error: "Error al crear producto",
      },
      { status: 500 }
    );
  }
}
