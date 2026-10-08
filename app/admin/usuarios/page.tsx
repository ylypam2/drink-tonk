import { prisma } from "@/lib/prisma";
import { obtenerUsuarioSesion } from "@/lib/autorizacion";
import CrearUsuarioForm from "@/components/CrearUsuarioForm";
import AccionesUsuario from "@/components/AccionesUsuario";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: boolean;
};

export default async function UsuariosPage() {
  const usuarioActual = await obtenerUsuarioSesion();

  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: "desc" },
  });

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
          <CrearUsuarioForm />
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
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-t">
                      <td className="p-3">{usuario.nombre}</td>
                      <td className="p-3">{usuario.email}</td>
                      <td className="p-3 capitalize">{usuario.rol}</td>
                      <td className="p-3">
                        {usuario.estado ? "Activo" : "Inactivo"}
                      </td>
                      <td className="p-3">
                        <AccionesUsuario
                          usuarioId={usuario.id}
                          nombre={usuario.nombre}
                          estado={usuario.estado}
                          rol={usuario.rol}
                          esUsuarioActual={usuario.id === usuarioActual.id}
                        />
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