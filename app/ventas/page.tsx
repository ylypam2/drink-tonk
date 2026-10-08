import { prisma } from "@/lib/prisma";
import RegistrarVentaForm from "@/components/RegistrarVentaForm";

export default async function VentasPage() {
  const [ventas, productos, clientes] = await Promise.all([
    prisma.venta.findMany({
      include: {
        usuario: {
          select: {
            nombre: true,
          },
        },
        cliente: {
          select: {
            nombre: true,
            identificacion: true,
          },
        },
        factura: {
          select: {
            numeroFactura: true,
          },
        },
        detallesVenta: {
          include: {
            producto: {
              select: {
                nombre: true,
                unidadMedida: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.producto.findMany({
      where: {
        estado: true,
        stock: {
          gt: 0,
        },
      },
      select: {
        id: true,
        nombre: true,
        precioVenta: true,
        stock: true,
        unidadMedida: true,
      },
      orderBy: {
        nombre: "asc",
      },
    }),

    prisma.cliente.findMany({
      where: {
        estado: true,
      },
      select: {
        id: true,
        nombre: true,
        identificacion: true,
      },
      orderBy: {
        nombre: "asc",
      },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de Ventas
          </h1>
          <p className="text-gray-600">
            Registra ventas a clientes.
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
            Historial de Ventas
          </h2>

          {ventas.length === 0 ? (
            <p className="text-gray-500">No hay ventas registradas.</p>
          ) : (
            <div className="space-y-4">
              {ventas.map((venta) => (
                <div key={venta.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-800">
                        Vendedor: {venta.usuario?.nombre}
                      </p>
                      {venta.cliente && (
                        <p className="text-sm text-gray-600">
                          Cliente: {venta.cliente.nombre}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Método: {venta.metodoPago}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(venta.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ${Number(venta.total).toFixed(2)}
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Productos:</p>
                    {venta.detallesVenta.map((detalle) => (
                      <div
                        key={detalle.id}
                        className="flex justify-between text-sm text-gray-600"
                      >
                        <span>
                          {detalle.producto?.nombre} x{detalle.cantidad}
                        </span>

                        <span>
                          ${Number(detalle.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
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
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Total ventas:</strong> {ventas.length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Productos disponibles:</strong> {productos.length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Total vendido:</strong> $
                {ventas.reduce((sum, v) => sum + Number(v.total), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
