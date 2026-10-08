import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderBy = searchParams.get("orderBy") || "nombre";
    const orderDirection = searchParams.get("orderDirection") || "asc";

    const productos = await prisma.producto.findMany({
      orderBy: {
        [orderBy]: orderDirection,
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
    const body = await request.json();

    const { nombre, descripcion, precioVenta, costoProduccion, stock, stockMinimo, unidadMedida, estado } = body;

    if (!nombre) {
      return Response.json(
        {
          success: false,
          error: "El campo nombre es obligatorio",
        },
        { status: 400 }
      );
    }

    if (!precioVenta) {
      return Response.json(
        {
          success: false,
          error: "El campo precioVenta es obligatorio",
        },
        { status: 400 }
      );
    }

    const data: any = {
      nombre,
      precioVenta: Number(precioVenta),
      costoProduccion: costoProduccion ? Number(costoProduccion) : 0,
      stock: stock ? Number(stock) : 0,
      stockMinimo: stockMinimo ? Number(stockMinimo) : 10,
      unidadMedida: unidadMedida || "unidad",
      estado: estado !== undefined ? estado : true,
    };

    if (descripcion !== undefined) {
      data.descripcion = descripcion;
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
