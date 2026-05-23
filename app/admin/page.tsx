import dbConnect from "@/lib/mongodb";
import Producto from "@/models/Producto";
import { crearProducto } from "../actions/productoActions";

export default async function AdminPage() {
  await dbConnect();

  const productos = await Producto.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        Panel de Administración
      </h1>
      <p className="text-gray-600 mb-8">
        Agrega nuevos productos directamente a la base de datos de MongoDB.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Agregar Producto
          </h2>

          <form action={crearProducto} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto
              </label>
              <input
                name="nombre"
                type="text"
                required
                placeholder="Ej. Coca Cola 350ml"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio ($)
                </label>
                <input
                  name="precio"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Inicial
                </label>
                <input
                  name="stock"
                  type="number"
                  required
                  placeholder="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="categoria"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una opción</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Snacks">Snacks</option>
                <option value="Lácteos">Lácteos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Imagen
              </label>
              <input
                name="imagen"
                type="text"
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors shadow-sm"
            >
              Guardar en Base de Datos
            </button>
          </form>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 h-fit">
          <h3 className="font-bold text-blue-800 mb-2">
            ¿Qué pasará al guardar?
          </h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            Al guardar, el producto se almacenará en MongoDB Atlas y el panel se
            actualizará mostrando el nuevo registro.
          </p>
        </div>
      </div>

      <div className="mt-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          Productos registrados
        </h2>

        {productos.length === 0 ? (
          <p className="text-gray-500">Aún no hay productos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Disponible</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto: any) => (
                  <tr key={producto._id.toString()} className="border-t">
                    <td className="p-3">{producto.nombre}</td>
                    <td className="p-3">{producto.categoria}</td>
                    <td className="p-3">${producto.precio}</td>
                    <td className="p-3">{producto.stock}</td>
                    <td className="p-3">
                      {producto.disponible ? "Sí" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}