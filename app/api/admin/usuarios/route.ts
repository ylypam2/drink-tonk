import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdministrador } from "@/lib/autorizacion";

export async function GET() {
  try {
    await exigirAdministrador();

    const usuarios = await prisma.usuario.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No fue posible obtener los usuarios" },
      { status: 500 }
    );
  }
}
