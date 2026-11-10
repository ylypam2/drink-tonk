export type ItemCarrito = {
  productoId: string;
  nombre: string;
  precioVenta: number;
  cantidad: number;
  unidadMedida: string;
};

const CARRITO_KEY = "drink_tonk_carrito";

export function obtenerCarrito(): ItemCarrito[] {
  if (typeof window === "undefined") return [];

  try {
    const guardado = localStorage.getItem(CARRITO_KEY);
    if (!guardado) return [];

    const carrito = JSON.parse(guardado);
    if (!Array.isArray(carrito)) return [];

    return carrito.filter((item) => {
      return (
        item &&
        typeof item === "object" &&
        typeof item.productoId === "string" &&
        typeof item.nombre === "string" &&
        typeof item.precioVenta === "number" &&
        typeof item.cantidad === "number" &&
        typeof item.unidadMedida === "string" &&
        item.cantidad > 0
      );
    });
  } catch {
    return [];
  }
}

export function guardarCarrito(carrito: ItemCarrito[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  } catch {
    // Silenciar errores de localStorage
  }
}

export function limpiarCarrito(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CARRITO_KEY);
  } catch {
    // Silenciar errores de localStorage
  }
}

export function agregarAlCarrito(
  producto: { id: string; nombre: string; precioVenta: number; unidadMedida: string },
  cantidad: number
): ItemCarrito[] {
  const carrito = obtenerCarrito();
  const existente = carrito.find((item) => item.productoId === producto.id);

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precioVenta: producto.precioVenta,
      cantidad,
      unidadMedida: producto.unidadMedida,
    });
  }

  guardarCarrito(carrito);
  return carrito;
}

export function actualizarCantidad(productoId: string, cantidad: number): ItemCarrito[] {
  const carrito = obtenerCarrito();
  const item = carrito.find((i) => i.productoId === productoId);

  if (item) {
    if (cantidad <= 0) {
      return eliminarDelCarrito(productoId);
    }
    item.cantidad = cantidad;
    guardarCarrito(carrito);
  }

  return carrito;
}

export function eliminarDelCarrito(productoId: string): ItemCarrito[] {
  const carrito = obtenerCarrito();
  const nuevoCarrito = carrito.filter((item) => item.productoId !== productoId);
  guardarCarrito(nuevoCarrito);
  return nuevoCarrito;
}

export function vaciarCarrito(): void {
  limpiarCarrito();
}
