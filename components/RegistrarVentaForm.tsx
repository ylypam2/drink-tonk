"use client";

import { useMemo, useState, useTransition } from "react";
import {
  registrarVenta,
  type ResultadoVenta,
} from "@/app/actions/ventaActions";

type ProductoDisponible = {
  id: string;
  nombre: string;
  precioVenta: number | string;
  stock: number;
  unidadMedida: string;
};

type ClienteActivo = {
  id: string;
  nombre: string;
  identificacion: string;
};

type ItemCarrito = {
  productoId: string;
  cantidad: number;
};

type Props = {
  productos: ProductoDisponible[];
  clientes: ClienteActivo[];
};

const IVA = 0.19;

export default function RegistrarVentaForm({
  productos,
  clientes,
}: Props) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);
  const [pendiente, startTransition] = useTransition();

  const productosPorId = useMemo(
    () => new Map(productos.map((producto) => [producto.id, producto])),
    [productos]
  );

  const resumen = useMemo(() => {
    const subtotal = items.reduce((acumulado, item) => {
      const producto = productosPorId.get(item.productoId);

      if (!producto) return acumulado;

      return acumulado + Number(producto.precioVenta) * item.cantidad;
    }, 0);

    const iva = subtotal * IVA;
    const total = subtotal + iva;

    return { subtotal, iva, total };
  }, [items, productosPorId]);

  function formatearMoneda(valor: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(valor);
  }

  function agregarProducto() {
    const primerProductoDisponible = productos.find(
      (producto) => !items.some((item) => item.productoId === producto.id)
    );

    if (!primerProductoDisponible) {
      setMensaje("Todos los productos disponibles ya fueron agregados.");
      setEsError(true);
      return;
    }

    setItems((actual) => [
      ...actual,
      {
        productoId: primerProductoDisponible.id,
        cantidad: 1,
      },
    ]);

    setMensaje("");
  }

  function cambiarProducto(indice: number, productoId: string) {
    setItems((actual) =>
      actual.map((item, posicion) =>
        posicion === indice
          ? {
              productoId,
              cantidad: 1,
            }
          : item
      )
    );
  }

  function cambiarCantidad(indice: number, cantidadIngresada: string) {
    const cantidad = Number.parseInt(cantidadIngresada, 10);

    setItems((actual) =>
      actual.map((item, posicion) => {
        if (posicion !== indice) return item;

        const producto = productosPorId.get(item.productoId);
        const maximo = producto?.stock ?? 1;

        return {
          ...item,
          cantidad: Number.isNaN(cantidad)
            ? 1
            : Math.min(Math.max(cantidad, 1), maximo),
        };
      })
    );
  }

  function quitarProducto(indice: number) {
    setItems((actual) =>
      actual.filter((_, posicion) => posicion !== indice)
    );
  }

  function registrar() {
    setMensaje("");
    setEsError(false);

    if (items.length === 0) {
      setMensaje("Agrega al menos un producto antes de registrar la venta.");
      setEsError(true);
      return;
    }

    const itemsInvalidos = items.some((item) => {
      const producto = productosPorId.get(item.productoId);

      return (
        !producto ||
        !Number.isInteger(item.cantidad) ||
        item.cantidad <= 0 ||
        item.cantidad > producto.stock
      );
    });

    if (itemsInvalidos) {
      setMensaje(
        "Revisa las cantidades: cada producto debe tener stock suficiente."
      );
      setEsError(true);
      return;
    }

    startTransition(async () => {
      try {
        const resultado: ResultadoVenta = await registrarVenta(
          items,
          clienteId || null,
          metodoPago
        );

        setMensaje(resultado.mensaje);
        setEsError(!resultado.ok);

        if (resultado.ok) {
          setItems([]);
          setClienteId("");
          setMetodoPago("EFECTIVO");
        }
      } catch {
        setMensaje("Ocurrió un error inesperado al registrar la venta.");
        setEsError(true);
      }
    });
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        No hay productos activos con stock disponible para registrar una venta.
      </div>
    );
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800">
          Registrar venta
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Agrega productos, selecciona el cliente si corresponde y confirma el
          método de pago.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="clienteId"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Cliente
          </label>

          <select
            id="clienteId"
            value={clienteId}
            onChange={(event) => setClienteId(event.target.value)}
            disabled={pendiente}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          >
            <option value="">Venta sin cliente registrado</option>

            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} — {cliente.identificacion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="metodoPago"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Método de pago
          </label>

          <select
            id="metodoPago"
            value={metodoPago}
            onChange={(event) => setMetodoPago(event.target.value)}
            disabled={pendiente}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-800">Productos</h3>

            <button
              type="button"
              onClick={agregarProducto}
              disabled={pendiente || items.length >= productos.length}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Agregar producto
            </button>
          </div>

          {items.length === 0 ? (
            <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              Aún no has agregado productos a la venta.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, indice) => {
                const producto = productosPorId.get(item.productoId);
                const precioUnitario = Number(producto?.precioVenta ?? 0);
                const subtotalLinea = precioUnitario * item.cantidad;

                return (
                  <div
                    key={`${item.productoId}-${indice}`}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-[1fr_110px_auto] sm:items-end">
                      <div>
                        <label
                          htmlFor={`producto-${indice}`}
                          className="mb-1 block text-xs font-medium text-slate-600"
                        >
                          Producto
                        </label>

                        <select
                          id={`producto-${indice}`}
                          value={item.productoId}
                          onChange={(event) =>
                            cambiarProducto(indice, event.target.value)
                          }
                          disabled={pendiente}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                        >
                          {productos.map((opcion) => (
                            <option key={opcion.id} value={opcion.id}>
                              {opcion.nombre} — stock: {opcion.stock}{" "}
                              {opcion.unidadMedida}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`cantidad-${indice}`}
                          className="mb-1 block text-xs font-medium text-slate-600"
                        >
                          Cantidad
                        </label>

                        <input
                          id={`cantidad-${indice}`}
                          type="number"
                          min={1}
                          max={producto?.stock ?? 1}
                          value={item.cantidad}
                          onChange={(event) =>
                            cambiarCantidad(indice, event.target.value)
                          }
                          disabled={pendiente}
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => quitarProducto(indice)}
                        disabled={pendiente}
                        className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap justify-between gap-2 border-t pt-3 text-sm">
                      <span className="text-slate-600">
                        {formatearMoneda(precioUnitario)} por{" "}
                        {producto?.unidadMedida ?? "unidad"}
                      </span>

                      <span className="font-semibold text-slate-800">
                        {formatearMoneda(subtotalLinea)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
          <div className="flex justify-between text-slate-700">
            <span>Subtotal</span>
            <span>{formatearMoneda(resumen.subtotal)}</span>
          </div>

          <div className="flex justify-between text-slate-700">
            <span>IVA (19%)</span>
            <span>{formatearMoneda(resumen.iva)}</span>
          </div>

          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatearMoneda(resumen.total)}</span>
          </div>
        </div>

        {mensaje && (
          <p
            role="status"
            aria-live="polite"
            className={`rounded-md p-3 text-sm ${
              esError
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {mensaje}
          </p>
        )}

        <button
          type="button"
          onClick={registrar}
          disabled={pendiente || items.length === 0}
          className="w-full rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {pendiente ? "Registrando venta..." : "Confirmar venta"}
        </button>
      </div>
    </section>
  );
}
