import { prisma } from "@/lib/prisma";
import RegistrarVentaForm from "@/components/RegistrarVentaForm";
import AccesoVentaRequerido from "@/components/AccesoVentaRequerido";
import { requireEmpleadoOAdmin } from "@/lib/auth";

export default async function VentasPage() {
  const sesion = await requireEmpleadoOAdmin();

  if (!sesion) {
    return <AccesoVentaRequerido />;
  }

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
        imagenUrl: true,
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
          href={sesion.rol === "ADMIN" ? "/admin" : "/empleado"}
          className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
        >
          Volver al panel
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Historial de Ventas
          </h2>

          {ventas.length === 0 ? (
            <p className="text-gray-500">No hay ventas registradas.</p>
          ) : (
            <div className="space-y-4">
              {ventas.map((venta) => (
                <article key={venta.id} className="border-b border-slate-200 py-4 last:border-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {venta.factura?.numeroFactura ?? `Venta ${venta.id.slice(-6)}`}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Vendedor: {venta.usuario.nombre}
                      </p>

                      <p className="text-sm text-slate-600">
                        Cliente: {venta.cliente?.nombre ?? "Venta sin cliente registrado"}
                      </p>

                      <p className="text-sm text-slate-600">
                        Pago: {venta.metodoPago}
                      </p>
                    </div>

                    <p className="font-bold text-emerald-700">
                      ${Number(venta.total).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-3 space-y-1 border-l-2 border-slate-200 pl-3">
                    {venta.detallesVenta.map((detalle) => (
                      <div
                        key={detalle.id}
                        className="flex justify-between gap-4 text-sm text-slate-600"
                      >
                        <span>
                          {detalle.producto.nombre} × {detalle.cantidad}{" "}
                          {detalle.producto.unidadMedida}
                        </span>

                        <span>${Number(detalle.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <RegistrarVentaForm
          productos={productos.map((producto) => ({
            ...producto,
            precioVenta: producto.precioVenta.toString(),
          }))}
          clientes={clientes}
        />
      </div>
    </div>
  );
}
