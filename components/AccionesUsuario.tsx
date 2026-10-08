"use client";

import { useState } from "react";
import {
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  eliminarUsuario,
} from "@/app/actions/usuarioActions";

type Props = {
  usuarioId: string;
  nombre: string;
  estado: boolean;
  rol: string;
  esUsuarioActual: boolean;
};

export default function AccionesUsuario({
  usuarioId,
  nombre,
  estado,
  rol,
  esUsuarioActual,
}: Props) {
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  async function ejecutar(
    accion: () => Promise<{ ok: boolean; mensaje: string }>
  ) {
    setOcupado(true);
    setMensaje("");

    try {
      const resultado = await accion();
      setMensaje(resultado.mensaje);
      setEsError(!resultado.ok);
    } catch {
      setMensaje("Ocurrió un error inesperado. Intenta nuevamente.");
      setEsError(true);
    } finally {
      setOcupado(false);
    }
  }

  function confirmarEstado() {
    const accion = estado ? "desactivar" : "activar";

    if (!window.confirm(`¿Deseas ${accion} a ${nombre}?`)) return;

    void ejecutar(() => cambiarEstadoUsuario(usuarioId, !estado));
  }

  function confirmarRol() {
    const nuevoRol = rol === "ADMIN" ? "EMPLEADO" : "ADMIN";

    if (!window.confirm(`¿Cambiar el rol de ${nombre} a ${nuevoRol}?`)) {
      return;
    }

    void ejecutar(() => cambiarRolUsuario(usuarioId, nuevoRol));
  }

  function confirmarEliminacion() {
    if (
      !window.confirm(
        `¿Eliminar permanentemente a ${nombre}?\n\nEsta acción no se puede deshacer.` 
      )
    ) {
      return;
    }

    void ejecutar(() => eliminarUsuario(usuarioId));
  }

  return (
    <div className="flex min-w-56 flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={confirmarEstado}
          disabled={ocupado || esUsuarioActual}
          title={esUsuarioActual ? "No puedes cambiar el estado de tu cuenta" : ""}
          className={`rounded px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 ${
            estado
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {estado ? "Desactivar" : "Activar"}
        </button>

        <button
          type="button"
          onClick={confirmarRol}
          disabled={ocupado || esUsuarioActual}
          title={esUsuarioActual ? "No puedes cambiar tu propio rol" : ""}
          className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cambiar rol
        </button>

        <button
          type="button"
          onClick={confirmarEliminacion}
          disabled={ocupado || esUsuarioActual}
          title={esUsuarioActual ? "No puedes eliminar tu propia cuenta" : ""}
          className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ocupado ? "Procesando..." : "Eliminar"}
        </button>
      </div>

      {mensaje && (
        <p
          role="status"
          aria-live="polite"
          className={`max-w-xs rounded px-2 py-1 text-xs ${
            esError
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
}
