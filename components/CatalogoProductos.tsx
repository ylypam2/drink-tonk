"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  type ItemCarrito,
} from "@/lib/carrito";

type Producto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioVenta: number;
  stock: number;
  unidadMedida: string;
  imagenUrl?: string | null;
};

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

type Props = {
  productos: Producto[];
};

export default function CatalogoProductos({ productos }: Props) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [mostrarAvisoAcceso, setMostrarAvisoAcceso] = useState(false);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [sesion, setSesion] = useState<{ rol: string } | null>(null);

  useEffect(() => {
    setCarrito(obtenerCarrito());
  }, []);

  useEffect(() => {
    let activo = true;

    async function verificarSesion() {
      try {
        const respuesta = await fetch("/api/auth/me");
        if (respuesta.ok) {
          const resultado = await respuesta.json();
          const usuario = resultado?.usuario;
          if (
            resultado?.success &&
            usuario &&
            (usuario.rol === "ADMIN" || usuario.rol === "EMPLEADO")
          ) {
            if (activo) setSesion(usuario);
          }
        }
      } catch {
        // Sin sesión válida: el flujo de acceso se muestra al terminar la compra.
      } finally {
        if (activo) setCargandoUsuario(false);
      }
    }

    verificarSesion();
    return () => {
      activo = false;
    };
  }, []);

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const subtotal = carrito.reduce(
    (sum, item) => sum + item.precioVenta * item.cantidad,
    0
  );
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  function handleIniciarSesion() {
    window.localStorage.setItem("drink_tonk_returnTo", "/ventas");
    router.push("/login");
  }

  function handleAgregar(producto: Producto, cantidad: number) {
    if (cantidad <= 0 || cantidad > producto.stock) {
      alert("Cantidad inválida o insuficiente");
      return;
    }
    const nuevoCarrito = agregarAlCarrito(producto, cantidad);
    setCarrito(nuevoCarrito);
  }

  function handleActualizarCantidad(productoId: string, cantidad: number) {
    const nuevoCarrito = actualizarCantidad(productoId, cantidad);
    setCarrito(nuevoCarrito);
  }

  function handleEliminar(productoId: string) {
    const nuevoCarrito = eliminarDelCarrito(productoId);
    setCarrito(nuevoCarrito);
  }

  function handleVaciar() {
    vaciarCarrito();
    setCarrito([]);
  }

  function handleTerminarCompra() {
    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    if (!sesion) {
      setMostrarAvisoAcceso(true);
      return;
    }

    router.push("/ventas");
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Catálogo de Productos
          </h1>
          <p className="text-gray-600">Explora nuestros productos disponibles.</p>
        </div>
        <button
          onClick={() => setMostrarCarrito(!mostrarCarrito)}
          className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
        >
          Carrito ({carrito.length})
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar producto por nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
      </div>

      {productosFiltrados.length === 0 ? (
        <p className="text-gray-500">
          {busqueda ? "No se encontraron productos." : "No hay productos disponibles."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map((producto) => {
            const cantidadEnCarrito = carrito.find(
              (item) => item.productoId === producto.id
            )?.cantidad || 0;
            const stockDisponible = producto.stock - cantidadEnCarrito;

            return (
              <div
                key={producto.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="mb-3 flex items-start gap-3">
                    <MiniaturaProducto
                      imagenUrl={producto.imagenUrl}
                      nombre={producto.nombre}
                      className="h-14 w-14"
                    />
                    <h3 className="font-bold text-lg text-gray-800">
                      {producto.nombre}
                    </h3>
                  </div>
                  {producto.descripcion && (
                    <p className="text-sm text-gray-600 mb-4">
                      {producto.descripcion}
                    </p>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      ${Number(producto.precioVenta).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {stockDisponible} {producto.unidadMedida}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max={stockDisponible}
                      defaultValue="1"
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                      id={`cantidad-${producto.id}`}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(
                          `cantidad-${producto.id}`
                        ) as HTMLInputElement;
                        const cantidad = parseInt(input.value, 10);
                        handleAgregar(producto, cantidad);
                      }}
                      disabled={stockDisponible <= 0}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Agregar
                    </button>
                  </div>
                  {stockDisponible <= 0 && (
                    <p className="text-red-600 text-sm mt-2">Agotado</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Carrito</h2>
                <button
                  onClick={() => setMostrarCarrito(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {carrito.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  El carrito está vacío
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {carrito.map((item) => (
                      <div
                        key={item.productoId}
                        className="flex items-center justify-between border-b pb-4"
                      >
                        <div className="flex-1 flex items-center gap-3">
                          <MiniaturaProducto
                            imagenUrl={item.imagenUrl}
                            nombre={item.nombre}
                            className="h-9 w-9"
                          />
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.nombre}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${item.precioVenta.toFixed(2)} × {item.cantidad}{" "}
                              {item.unidadMedida}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) =>
                              handleActualizarCantidad(
                                item.productoId,
                                parseInt(e.target.value, 10)
                              )
                            }
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
                          />
                          <button
                            onClick={() => handleEliminar(item.productoId)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t pt-4 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>IVA (19%)</span>
                      <span>${iva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>Total estimado</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      El total definitivo lo calcula el servidor al confirmar la
                      venta.
                    </p>
                  </div>

                  {mostrarAvisoAcceso ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4">
                      <p className="text-sm text-amber-800">
                        La finalización de esta venta requiere acceso de empleado
                        o administrador.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={handleIniciarSesion}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                          Iniciar sesión
                        </button>
                        <button
                          onClick={() => setMostrarAvisoAcceso(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        >
                          Seguir comprando
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleVaciar}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                      >
                        Vaciar
                      </button>
                      <button
                        onClick={() => setMostrarCarrito(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                      >
                        Seguir comprando
                      </button>
                      <button
                        onClick={handleTerminarCompra}
                        disabled={cargandoUsuario}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 disabled:bg-gray-400"
                      >
                        Terminar compra
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
