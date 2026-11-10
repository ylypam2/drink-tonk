import { verificarAdministradorParaPagina } from "@/lib/autorizacionPaginas";

export default async function AdminPage() {
  const usuario = await verificarAdministradorParaPagina();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        Panel de Administración
      </h1>
      <p className="text-gray-600 mb-8">
        Gestiona todos los módulos del sistema.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/admin/productos" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">📦</div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">Productos</h3>
          <p className="text-sm text-gray-600">Gestiona inventario de productos</p>
        </a>

        <a href="/admin/usuarios" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">Usuarios</h3>
          <p className="text-sm text-gray-600">Gestiona administradores y empleados</p>
        </a>

        <a href="/admin/proveedores" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">🏢</div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">Proveedores</h3>
          <p className="text-sm text-gray-600">Gestiona proveedores de insumos</p>
        </a>

        <a href="/compras" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">🛒</div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">Compras</h3>
          <p className="text-sm text-gray-600">Registra compras de insumos</p>
        </a>

        <a href="/ventas" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">Ventas</h3>
          <p className="text-sm text-gray-600">Registra ventas a clientes</p>
        </a>
      </div>
    </div>
  );
}