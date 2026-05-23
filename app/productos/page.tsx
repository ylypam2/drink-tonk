import dbConnect from "@/lib/mongodb";
import Producto from "@/models/Producto";
import type { IProducto } from "../../models/Producto";

export const revalidate = 0; 

export default async function ProductosPage() {
  await dbConnect();
  
  const productosRaw = await Producto.find({}).sort({ createdAt: -1 });

  const productos: IProducto[] = productosRaw.map((doc) => {
    const producto = doc.toObject();
    producto._id = producto._id.toString();
    return producto;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-gray-800">📦 Catálogo de Productos</h1>
      <p className="text-gray-600 mb-6">Bebidas y productos disponibles en tiempo real desde la base de datos.</p>

      {productos.length === 0 ? (
        <div className="bg-gray-100 text-center p-8 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">No hay productos registrados aún.</p>
          <p className="text-sm text-gray-400 mt-1">Ve al panel de Administración para agregar el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productos.map((prod) => (
            <div key={prod._id as string} className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="h-40 bg-blue-50 rounded-lg mb-3 flex items-center justify-center text-blue-400 font-bold text-3xl">
                🍹
              </div>
              <h3 className="font-bold text-lg text-gray-800 capitalize">{prod.nombre}</h3>
              <p className="text-sm text-gray-500 mb-2">Categoría: {prod.categoria}</p>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-2xl font-extrabold text-blue-600">${prod.precio.toFixed(2)}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${prod.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {prod.stock > 0 ? `${prod.stock} disp.` : 'Agotado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}