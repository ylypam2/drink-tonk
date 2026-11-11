import { prisma } from "@/lib/prisma";
import CatalogoProductos from "@/components/CatalogoProductos";

export const revalidate = 0;

export default async function ProductosPage() {
  const productos = await prisma.producto.findMany({
    where: { estado: true },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      precioVenta: true,
      stock: true,
      unidadMedida: true,
      imagenUrl: true,
    },
    orderBy: { nombre: 'asc' }
  });

  return (
    <CatalogoProductos
      productos={productos.map((producto) => ({
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precioVenta: Number(producto.precioVenta),
        stock: producto.stock,
        unidadMedida: producto.unidadMedida,
        imagenUrl: producto.imagenUrl,
      }))}
    />
  );
}