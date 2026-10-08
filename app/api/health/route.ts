import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalProductos = await prisma.producto.count();

    return NextResponse.json(
      {
        success: true,
        mensaje: "Backend y conexión con la base de datos funcionando correctamente",
        baseDatos: "PostgreSQL en Neon",
        totalProductos,
        fecha: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al verificar la conexión con la base de datos:", error);

    return NextResponse.json(
      {
        success: false,
        mensaje:
          "El servidor está activo, pero no fue posible verificar la conexión con la base de datos",
      },
      { status: 500 }
    );
  }
}