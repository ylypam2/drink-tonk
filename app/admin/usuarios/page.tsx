import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Usuario from "@/models/Usuario";
import { requireAdmin } from "@/lib/auth";
import { crearUsuario } from "@/app/actions/usuarioActions";

export default async function UsuariosPage() {
  const sesion = await requireAdmin();

  if (!sesion) {
    redirect("/login");
  }

  await dbConnect();
  const usuarios = await Usuario.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestión de usuarios
          </h1>
          <p className="text-gray-600">
            Aquí puedes crear administradores y empleados.
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
            Crear usuario
          </h2>

          <form action={crearUsuario} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                name="nombre"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                name="rol"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="empleado">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors"
            >
              Guardar usuario
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Usuarios registrados
          </h2>

          {usuarios.length === 0 ? (
            <p className="text-gray-500">No hay usuarios registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Correo</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario: any) => (
                    <tr key={usuario._id.toString()} className="border-t">
                      <td className="p-3">{usuario.nombre}</td>
                      <td className="p-3">{usuario.email}</td>
                      <td className="p-3 capitalize">{usuario.rol}</td>
                      <td className="p-3">
                        {usuario.estado ? "Activo" : "Inactivo"}
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