import { redirect } from "next/navigation";
import { obtenerUsuarioSesion, ErrorTipo, ErrorAutorizacion } from "@/lib/autorizacion";

export async function verificarAdministradorParaPagina() {
  try {
    const usuario = await obtenerUsuarioSesion();
    return usuario;
  } catch (error) {
    if (error instanceof ErrorAutorizacion) {
      if (error.tipo === ErrorTipo.SESION_INVALIDA || error.tipo === ErrorTipo.USUARIO_INACTIVO) {
        redirect("/login");
      }
      if (error.tipo === ErrorTipo.PERMISO_DENEGADO) {
        redirect("/empleado");
      }
      if (error.tipo === ErrorTipo.ROL_INVALIDO) {
        redirect("/login");
      }
    }
    throw error;
  }
}
