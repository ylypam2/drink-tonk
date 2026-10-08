import { prisma } from "@/lib/prisma";

export default async function ComprasPage() {
  const compras = await prisma.compraInsumo.findMany({
    include: {
      usuario: true,
      proveedor: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const proveedores = await prisma.proveedor.findMany();
  const insumos = await prisma.insumo.findMany();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de Compras de Insumos
          </h1>
          <p className="text-gray-600">
            Registra compras de insumos a proveedores.
          </p>
        </div>

        <a
          href="/admin"
          className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
        >
          Volver al panel
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Historial de Compras
          </h2>

          {compras.length === 0 ? (
            <p className="text-gray-500">No hay compras registradas.</p>
          ) : (
            <div className="space-y-4">
              {compras.map((compra) => (
                <div key={compra.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-800">
                        Proveedor: {compra.proveedor?.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        Usuario: {compra.usuario?.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        Factura: {compra.numeroFactura}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(compra.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      ${Number(compra.total).toFixed(2)}
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Estado: {compra.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Información
          </h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Total compras:</strong> {compras.length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Proveedores activos:</strong> {proveedores.length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Insumos disponibles:</strong> {insumos.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
