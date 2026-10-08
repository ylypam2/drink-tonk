import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function ProductosPage() {
  const productos = await prisma.producto.findMany({
    where: { estado: true },
    orderBy: { nombre: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Catálogo de Productos</h1>
      <p className="text-gray-600 mb-8">Explora nuestros productos disponibles.</p>

      {productos.length === 0 ? (
        <p className="text-gray-500">No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <div key={producto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{producto.nombre}</h3>
                {producto.descripcion && (
                  <p className="text-sm text-gray-600 mb-4">{producto.descripcion}</p>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ${Number(producto.precioVenta).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {producto.stock} {producto.unidadMedida}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${producto.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {producto.stock > 0 ? 'Disponible' : 'Agotado'}
                  </span>
                  {producto.stock > 0 && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                      Agregar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}