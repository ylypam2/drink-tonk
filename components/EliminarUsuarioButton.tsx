"use client";

import { useState } from "react";

type ResultadoAccion = {
  ok: boolean;
  mensaje: string;
};

type EliminarUsuarioButtonProps = {
  usuarioId: string;
  nombreUsuario: string;
  eliminarUsuario: (usuarioId: string) => Promise<ResultadoAccion>;
  onEliminado?: () => void;
};

export default function EliminarUsuarioButton({
  usuarioId,
  nombreUsuario,
  eliminarUsuario,
  onEliminado,
}: EliminarUsuarioButtonProps) {
  const [eliminando, setEliminando] = useState(false);

  async function confirmarEliminacion() {
    const confirmado = window.confirm(
      `¿Deseas eliminar permanentemente a "${nombreUsuario}"?\n\nEsta acción no se puede deshacer.` 
    );

    if (!confirmado) {
      return;
    }

    setEliminando(true);

    try {
      const resultado = await eliminarUsuario(usuarioId);
      
      if (!resultado.ok) {
        window.alert(resultado.mensaje);
        setEliminando(false);
      } else {
        onEliminado?.();
      }
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el usuario.";

      window.alert(mensaje);
      setEliminando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={confirmarEliminacion}
      disabled={eliminando}
      className="rounded bg-red-600 px-2 py-1 text-xs text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {eliminando ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
