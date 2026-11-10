import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { crearProveedor } from "@/app/actions/proveedorActions";
import { verificarAdministradorParaPagina } from "@/lib/autorizacionPaginas";

export default async function ProveedoresPage() {
  await verificarAdministradorParaPagina();

  const proveedores = await prisma.proveedor.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de Proveedores
          </h1>
          <p className="text-gray-600">
            Administra los proveedores de productos.
          </p>
        </div>

        <a
          href="/admin"
          className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
        >
          Volver al panel
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Crear proveedor
          </h2>

          <form action={crearProveedor} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                name="nombre"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nombre de la empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificación
              </label>
              <input
                name="identificacion"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="RUC, NIT o documento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacto
              </label>
              <input
                name="contacto"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nombre del contacto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                name="telefono"
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Número de teléfono"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
            >
              Guardar proveedor
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Proveedores registrados
          </h2>

          {proveedores.length === 0 ? (
            <p className="text-gray-500">No hay proveedores registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Identificación</th>
                    <th className="p-3">Contacto</th>
                    <th className="p-3">Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((proveedor) => (
                    <tr key={proveedor.id} className="border-t">
                      <td className="p-3 font-medium">{proveedor.nombre}</td>
                      <td className="p-3 text-gray-600">{proveedor.identificacion}</td>
                      <td className="p-3 text-gray-600">{proveedor.contacto || '-'}</td>
                      <td className="p-3 text-gray-600">{proveedor.telefono || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
