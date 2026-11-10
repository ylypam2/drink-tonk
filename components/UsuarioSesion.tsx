import { obtenerUsuarioSesion } from "@/lib/autorizacion";

export default async function UsuarioSesion() {
  const usuario = await obtenerUsuarioSesion().catch(() => null);

  if (!usuario) {
    return null;
  }

  return (
    <>
      <span className="hidden border-l border-blue-400 pl-4 text-xs text-blue-100 lg:inline">
        {usuario.nombre}
      </span>
      <input
        type="hidden"
        name="usuario-rol"
        value={usuario.rol}
        data-nombre={usuario.nombre}
      />
    </>
  );
}
