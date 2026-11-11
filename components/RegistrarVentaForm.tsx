"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import {
  registrarVenta,
  type ResultadoVenta,
} from "@/app/actions/ventaActions";
import { crearCliente } from "@/app/actions/clienteActions";
import {
  obtenerCarrito,
  limpiarCarrito,
  type ItemCarrito as ItemCarritoPersistente,
} from "@/lib/carrito";

type ProductoDisponible = {
  id: string;
  nombre: string;
  precioVenta: number | string;
  stock: number;
  unidadMedida: string;
  imagenUrl?: string | null;
  estado?: boolean;
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

function MiniaturaProducto({
  imagenUrl,
  nombre,
  className = "h-10 w-10",
}: {
  imagenUrl?: string | null;
  nombre: string;
  className?: string;
}) {
  const [errorImagen, setErrorImagen] = useState(false);

  if (!imagenUrl || errorImagen) {
    return (
      <div
        className={`${className} flex shrink-0 items-center justify-center rounded-md bg-slate-200 text-[10px] font-medium text-slate-500`}
        aria-hidden="true"
      >
        Sin imagen
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imagenUrl}
      alt={nombre}
      onError={() => setErrorImagen(true)}
      className={`${className} shrink-0 rounded-md object-cover`}
    />
  );
}

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
  }).format(valor);
}

export default function RegistrarVentaForm({
  productos,
  clientes,
}: Props) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [aplicarIva, setAplicarIva] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);
  const [pendiente, startTransition] = useTransition();
  const [carritoPrecargado, setCarritoPrecargado] = useState(false);
  const [preciosServidor, setPreciosServidor] = useState<
    Record<string, number>
  >({});
  const precargaAplicada = useRef(false);

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState<
    ProductoDisponible[]
  >([]);
  const [buscandoProductos, setBuscandoProductos] = useState(false);
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [productosExtra, setProductosExtra] = useState<
    Record<string, ProductoDisponible>
  >({});

  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
  const [guardandoCliente, setGuardandoCliente] = useState(false);
  const [errorCliente, setErrorCliente] = useState("");
  const [formCliente, setFormCliente] = useState({
    nombre: "",
    identificacion: "",
    telefono: "",
    email: "",
    direccion: "",
  });
  const [clientesExtra, setClientesExtra] = useState<ClienteActivo[]>([]);

  useEffect(() => {
    if (precargaAplicada.current) return;
    precargaAplicada.current = true;

    const carritoPersistente = obtenerCarrito();
    if (carritoPersistente.length === 0) return;

    const agrupado = new Map<string, number>();
    for (const item of carritoPersistente) {
      if (
        !item ||
        typeof item.productoId !== "string" ||
        !Number.isFinite(item.cantidad) ||
        item.cantidad <= 0
      ) {
        continue;
      }
      agrupado.set(
        item.productoId,
        (agrupado.get(item.productoId) ?? 0) + item.cantidad
      );
    }

    setItems(
      Array.from(agrupado, ([productoId, cantidad]) => ({
        productoId,
        cantidad,
      }))
    );
    setCarritoPrecargado(true);
  }, []);

  const productosPorId = useMemo(() => {
    const mapa = new Map<string, ProductoDisponible>();

    for (const producto of productos) {
      mapa.set(producto.id, { ...producto });
    }
    for (const producto of Object.values(productosExtra)) {
      mapa.set(producto.id, { ...producto });
    }
    for (const [productoId, precio] of Object.entries(preciosServidor)) {
      const producto = mapa.get(productoId);
      if (producto) {
        mapa.set(productoId, { ...producto, precioVenta: precio });
      }
    }

    return mapa;
  }, [productos, productosExtra, preciosServidor]);

  const resumen = useMemo(() => {
    const subtotal = items.reduce((acumulado, item) => {
      const producto = productosPorId.get(item.productoId);

      if (!producto) return acumulado;

      return acumulado + Number(producto.precioVenta) * item.cantidad;
    }, 0);

    const iva = aplicarIva ? subtotal * IVA : 0;
    const total = subtotal + iva;

    return { subtotal, iva, total };
  }, [items, productosPorId, aplicarIva]);

  const idsEnVenta = useMemo(
    () => new Set(items.map((item) => item.productoId)),
    [items]
  );

  const resultadosDisponibles = useMemo(
    () =>
      resultadosBusqueda.filter(
        (producto) =>
          !idsEnVenta.has(producto.id) &&
          producto.estado !== false &&
          Number(producto.stock) > 0
      ),
    [resultadosBusqueda, idsEnVenta]
  );

  const terminoBusqueda = busquedaProducto.trim();
  const mostrarResultados =
    selectorAbierto && terminoBusqueda.length >= 2;

  useEffect(() => {
    if (!mostrarResultados) {
      setResultadosBusqueda([]);
      return;
    }

    const temporizador = setTimeout(async () => {
      setBuscandoProductos(true);
      try {
        const respuesta = await fetch(
          `/api/productos?search=${encodeURIComponent(terminoBusqueda)}`
        );
        const resultado = await respuesta.json();

        if (resultado?.success && Array.isArray(resultado.data)) {
          setResultadosBusqueda(
            resultado.data.map(
              (producto: Record<string, unknown>): ProductoDisponible => ({
                id: String(producto.id),
                nombre: String(producto.nombre),
                precioVenta: producto.precioVenta as number | string,
                stock: Number(producto.stock),
                unidadMedida: String(producto.unidadMedida ?? "unidad"),
                imagenUrl:
                  typeof producto.imagenUrl === "string"
                    ? producto.imagenUrl
                    : null,
                estado: producto.estado as boolean | undefined,
              })
            )
          );
        } else {
          setResultadosBusqueda([]);
        }
      } catch {
        setResultadosBusqueda([]);
      } finally {
        setBuscandoProductos(false);
      }
    }, 300);

    return () => clearTimeout(temporizador);
  }, [terminoBusqueda, mostrarResultados]);

  const opcionesCliente = useMemo(() => {
    const vistos = new Set(clientes.map((cliente) => cliente.id));
    return [
      ...clientes,
      ...clientesExtra.filter((cliente) => !vistos.has(cliente.id)),
    ];
  }, [clientes, clientesExtra]);

  function problemaItem(item: ItemCarrito): string | null {
    const producto = productosPorId.get(item.productoId);

    if (!producto) {
      return "Este producto ya no está disponible. Quítalo de la venta.";
    }

    if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      return "La cantidad debe ser un entero mayor a cero.";
    }

    if (item.cantidad > producto.stock) {
      return `Stock insuficiente: disponible ${producto.stock} ${producto.unidadMedida}.`;
    }

    return null;
  }

  function agregarDesdeSelector(producto: ProductoDisponible) {
    if (idsEnVenta.has(producto.id)) return;
    if (Number(producto.stock) <= 0) return;

    setProductosExtra((actual) => ({
      ...actual,
      [producto.id]: producto,
    }));
    setItems((actual) => [
      ...actual,
      { productoId: producto.id, cantidad: 1 },
    ]);
    setBusquedaProducto("");
    setSelectorAbierto(false);
    setMensaje("");
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

  function abrirModalCliente() {
    setFormCliente({
      nombre: "",
      identificacion: "",
      telefono: "",
      email: "",
      direccion: "",
    });
    setErrorCliente("");
    setModalClienteAbierto(true);
  }

  async function handleCrearCliente(evento: React.FormEvent) {
    evento.preventDefault();
    if (guardandoCliente) return;

    setGuardandoCliente(true);
    setErrorCliente("");

    try {
      const datos = new FormData();
      datos.append("nombre", formCliente.nombre);
      datos.append("identificacion", formCliente.identificacion);
      datos.append("telefono", formCliente.telefono);
      datos.append("email", formCliente.email);
      datos.append("direccion", formCliente.direccion);

      const cliente = await crearCliente(datos);

      setClientesExtra((actual) => [...actual, cliente]);
      setClienteId(cliente.id);
      setModalClienteAbierto(false);
      setMensaje("");
    } catch (error) {
      setErrorCliente(
        error instanceof Error
          ? error.message
          : "No fue posible crear el cliente."
      );
    } finally {
      setGuardandoCliente(false);
    }
  }

  function registrar() {
    setMensaje("");
    setEsError(false);

    if (items.length === 0) {
      setMensaje("Agrega al menos un producto antes de registrar la venta.");
      setEsError(true);
      return;
    }

    const problemas = items
      .map((item) => problemaItem(item))
      .filter((problema): problema is string => problema !== null);

    if (problemas.length > 0) {
      setMensaje(
        `Revisa los productos antes de confirmar: ${[...new Set(problemas)].join(" ")}`
      );
      setEsError(true);
      return;
    }

    startTransition(async () => {
      try {
        const resultado: ResultadoVenta = await registrarVenta(
          items,
          clienteId || null,
          metodoPago,
          { totalEsperado: resumen.total, aplicarIva }
        );

        setMensaje(resultado.mensaje);
        setEsError(!resultado.ok);

        if (resultado.requiereRevision && resultado.lineas) {
          const overrides: Record<string, number> = {};
          for (const linea of resultado.lineas) {
            overrides[linea.productoId] = linea.precioUnitario;
          }
          setPreciosServidor(overrides);

          if (resultado.resumen) {
            setMensaje(
              `${resultado.mensaje} Nuevo total estimado: ${formatearMoneda(resultado.resumen.total)}.`
            );
          }
          return;
        }

        if (resultado.ok) {
          const comprobante =
            resultado.numeroFactura ?? resultado.ventaId ?? "";
          setMensaje(
            comprobante
              ? `${resultado.mensaje} Comprobante: ${comprobante}`
              : resultado.mensaje
          );
          setItems([]);
          setClienteId("");
          setMetodoPago("EFECTIVO");
          setAplicarIva(true);
          setCarritoPrecargado(false);
          setPreciosServidor({});
          limpiarCarrito();
        }
      } catch {
        setMensaje("Ocurrió un error inesperado al registrar la venta.");
        setEsError(true);
      }
    });
  }

  if (productos.length === 0 && items.length === 0) {
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
          {carritoPrecargado && (
            <span className="ml-1 font-medium text-blue-700">
              (Carrito precargado desde el catálogo)
            </span>
          )}
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

          <div className="flex gap-2">
            <select
              id="clienteId"
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
              disabled={pendiente}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">Venta sin cliente registrado</option>

              {opcionesCliente.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} — {cliente.identificacion}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={abrirModalCliente}
              disabled={pendiente}
              className="shrink-0 rounded-md border border-blue-600 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Nuevo cliente
            </button>
          </div>
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
          <h3 className="mb-3 font-semibold text-slate-800">Productos</h3>

          <div className="relative mb-4">
            <label
              htmlFor="buscarProducto"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Agregar producto
            </label>

            <input
              id="buscarProducto"
              type="text"
              value={busquedaProducto}
              onChange={(event) => {
                setBusquedaProducto(event.target.value);
                setSelectorAbierto(true);
              }}
              onFocus={() => setSelectorAbierto(true)}
              onBlur={() => setTimeout(() => setSelectorAbierto(false), 150)}
              disabled={pendiente}
              placeholder="Buscar producto…"
              autoComplete="off"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />

            {mostrarResultados && (
              <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                {buscandoProductos ? (
                  <p className="px-3 py-2 text-sm text-slate-500">
                    Buscando…
                  </p>
                ) : resultadosDisponibles.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate-500">
                    {resultadosBusqueda.length > 0
                      ? "No hay más productos disponibles para agregar"
                      : "No se encontraron productos"}
                  </p>
                ) : (
                  <ul>
                    {resultadosDisponibles.map((producto) => (
                      <li key={producto.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => agregarDesdeSelector(producto)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-blue-50"
                        >
                          <MiniaturaProducto
                            imagenUrl={producto.imagenUrl}
                            nombre={producto.nombre}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-slate-800">
                              {producto.nombre}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {formatearMoneda(Number(producto.precioVenta))} ·{" "}
                              {producto.stock} {producto.unidadMedida}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              Aún no has agregado productos a la venta.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, indice) => {
                const producto = productosPorId.get(item.productoId);
                const problema = problemaItem(item);
                const precioUnitario = Number(producto?.precioVenta ?? 0);
                const subtotalLinea = precioUnitario * item.cantidad;

                return (
                  <div
                    key={`${item.productoId}-${indice}`}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <MiniaturaProducto
                        imagenUrl={producto?.imagenUrl}
                        nombre={producto?.nombre ?? "Producto"}
                        className="h-12 w-12"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {producto?.nombre ?? "Producto no disponible"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatearMoneda(precioUnitario)} por{" "}
                          {producto?.unidadMedida ?? "unidad"}
                        </p>
                      </div>

                      <div className="w-24">
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

                    {problema && (
                      <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                        {problema}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap justify-between gap-2 border-t pt-3 text-sm">
                      <span className="text-slate-600">Subtotal línea</span>

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
            <span>
              {aplicarIva
                ? formatearMoneda(resumen.iva)
                : "No aplicado"}
            </span>
          </div>

          <label className="flex items-center gap-2 pt-1 text-slate-700">
            <input
              type="checkbox"
              checked={aplicarIva}
              onChange={(event) => setAplicarIva(event.target.checked)}
              disabled={pendiente}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span>Aplicar IVA (19 %)</span>
          </label>

          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
            <span>Total estimado</span>
            <span>{formatearMoneda(resumen.total)}</span>
          </div>
          <p className="text-xs text-slate-500">
            El servidor recalcula precios e impuestos al confirmar; si difieren
            se te pedirá revisar antes de registrar.
          </p>
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

      {modalClienteAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                Nuevo cliente
              </h3>
              <button
                type="button"
                onClick={() => setModalClienteAbierto(false)}
                className="text-slate-500 hover:text-slate-700"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearCliente} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formCliente.nombre}
                  onChange={(event) =>
                    setFormCliente((actual) => ({
                      ...actual,
                      nombre: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Identificación *
                </label>
                <input
                  type="text"
                  required
                  value={formCliente.identificacion}
                  onChange={(event) =>
                    setFormCliente((actual) => ({
                      ...actual,
                      identificacion: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formCliente.telefono}
                    onChange={(event) =>
                      setFormCliente((actual) => ({
                        ...actual,
                        telefono: event.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formCliente.email}
                    onChange={(event) =>
                      setFormCliente((actual) => ({
                        ...actual,
                        email: event.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formCliente.direccion}
                  onChange={(event) =>
                    setFormCliente((actual) => ({
                      ...actual,
                      direccion: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              {errorCliente && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorCliente}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={guardandoCliente}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
                >
                  {guardandoCliente ? "Guardando..." : "Guardar cliente"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalClienteAbierto(false)}
                  disabled={guardandoCliente}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
