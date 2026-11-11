"use client";

import { useState, useEffect } from "react";
import { crearProducto, actualizarProducto, eliminarProducto, toggleEstadoProducto } from "@/app/actions/productoActions";

interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioVenta: number;
  costoProduccion: number;
  stock: number;
  stockMinimo: number;
  unidadMedida: string;
  estado: boolean;
  imagenUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

const FORM_VACIO = {
  nombre: "",
  descripcion: "",
  precioVenta: "",
  costoProduccion: "",
  stock: "",
  stockMinimo: "",
  unidadMedida: "unidad",
  imagenUrl: "",
};

function MiniaturaProducto({ imagenUrl, nombre }: { imagenUrl?: string | null; nombre: string }) {
  const [errorImagen, setErrorImagen] = useState(false);

  if (!imagenUrl || errorImagen) {
    return (
      <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded bg-gray-200 text-[9px] text-gray-500">
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
      className="h-9 w-9 shrink-0 rounded object-cover"
    />
  );
}

export default function ProductosAdminPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(FORM_VACIO);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const url = searchTerm 
        ? `/api/productos?search=${encodeURIComponent(searchTerm)}`
        : "/api/productos";
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setProductos(result.data);
      } else {
        setError(result.error || "Error al cargar productos");
      }
    } catch (err) {
      setError("Error de conexión al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchProductos();
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append("nombre", formData.nombre);
      formDataObj.append("descripcion", formData.descripcion);
      formDataObj.append("precioVenta", formData.precioVenta);
      formDataObj.append("costoProduccion", formData.costoProduccion);
      formDataObj.append("stockMinimo", formData.stockMinimo);
      formDataObj.append("unidadMedida", formData.unidadMedida);
      formDataObj.append("imagenUrl", formData.imagenUrl);

      if (editingProducto) {
        formDataObj.append("id", editingProducto.id);
        await actualizarProducto(formDataObj);
        setSuccess("Producto actualizado correctamente");
        setEditingProducto(null);
      } else {
        formDataObj.append("stock", formData.stock);
        await crearProducto(formDataObj);
        setSuccess("Producto creado correctamente");
      }

      setFormData(FORM_VACIO);
      fetchProductos();
    } catch (err: any) {
      setError(err.message || "Error al guardar producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precioVenta: producto.precioVenta.toString(),
      costoProduccion: producto.costoProduccion.toString(),
      stock: producto.stock.toString(),
      stockMinimo: producto.stockMinimo.toString(),
      unidadMedida: producto.unidadMedida,
      imagenUrl: producto.imagenUrl ?? "",
    });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const formData = new FormData();
      formData.append("id", id);
      await eliminarProducto(formData);
      setSuccess("Producto eliminado correctamente");
      fetchProductos();
    } catch (err: any) {
      setError(err.message || "Error al eliminar producto");
    }
  };

  const handleToggleEstado = async (id: string) => {
    try {
      const formData = new FormData();
      formData.append("id", id);
      await toggleEstadoProducto(formData);
      setSuccess("Estado del producto actualizado");
      fetchProductos();
    } catch (err: any) {
      setError(err.message || "Error al cambiar estado del producto");
    }
  };

  const cancelEdit = () => {
    setEditingProducto(null);
    setFormData(FORM_VACIO);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de Productos
          </h1>
          <p className="text-gray-600">
            Administra el inventario de productos.
          </p>
        </div>

        <a
          href="/admin"
          className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
        >
          Volver al panel
        </a>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            {editingProducto ? "Editar producto" : "Crear producto"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Venta
                </label>
                <input
                  name="precioVenta"
                  type="number"
                  step="0.01"
                  required
                  value={formData.precioVenta}
                  onChange={(e) => setFormData({ ...formData, precioVenta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo Producción
                </label>
                <input
                  name="costoProduccion"
                  type="number"
                  step="0.01"
                  value={formData.costoProduccion}
                  onChange={(e) => setFormData({ ...formData, costoProduccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock {editingProducto && "(solo lectura - editar desde movimientos de inventario)"}
                </label>
                <input
                  name="stock"
                  type="number"
                  required={!editingProducto}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  readOnly={!!editingProducto}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${editingProducto ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Mínimo
                </label>
                <input
                  name="stockMinimo"
                  type="number"
                  value={formData.stockMinimo}
                  onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad de Medida
              </label>
              <select
                name="unidadMedida"
                value={formData.unidadMedida}
                onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="litro">Litro</option>
                <option value="caja">Caja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enlace de imagen (opcional)
              </label>
              <input
                name="imagenUrl"
                type="url"
                value={formData.imagenUrl}
                onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Solo URLs http o https. Se muestra como vista previa; no se
                guarda hasta confirmar el producto.
              </p>
              {formData.imagenUrl.trim() !== "" && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imagenUrl}
                    alt="Vista previa de la imagen del producto"
                    className="h-20 w-20 rounded-md border border-gray-200 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              {editingProducto?.imagenUrl && formData.imagenUrl.trim() === "" && (
                <p className="mt-1 text-xs text-amber-600">
                  Al guardar sin enlace se quitará la imagen actual del producto.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-md transition-colors"
              >
                {isSubmitting ? "Guardando..." : editingProducto ? "Actualizar" : "Guardar producto"}
              </button>
              {editingProducto && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-md transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">
              Productos registrados
            </h2>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Cargando productos...</p>
          ) : productos.length === 0 ? (
            <p className="text-gray-500">
              {searchTerm ? "No se encontraron productos." : "No hay productos registrados."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Precio Venta</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <MiniaturaProducto imagenUrl={producto.imagenUrl} nombre={producto.nombre} />
                          <span>{producto.nombre}</span>
                        </div>
                      </td>
                      <td className="p-3">${Number(producto.precioVenta).toFixed(2)}</td>
                      <td className="p-3">
                        <span className={producto.stock <= producto.stockMinimo ? "text-red-600 font-medium" : ""}>
                          {producto.stock}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          producto.estado 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {producto.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleEstado(producto.id)}
                          className="text-yellow-600 hover:text-yellow-800 text-sm"
                        >
                          {producto.estado ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => handleDelete(producto.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      </td>
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
