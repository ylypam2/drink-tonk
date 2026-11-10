import { prisma } from "@/lib/prisma";
import CatalogoProductos from "@/components/CatalogoProductos";

export const revalidate = 0;

export default async function ProductosPage() {
  const productos = await prisma.producto.findMany({
    where: { estado: true },
    orderBy: { nombre: 'asc' }
  });

  return <CatalogoProductos productos={productos} />;
}