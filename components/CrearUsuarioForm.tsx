"use client";

import { useActionState } from "react";
import {
  crearUsuario,
  type ResultadoAccion,
} from "@/app/actions/usuarioActions";

const estadoInicial: ResultadoAccion = {
  ok: false,
  mensaje: "",
};

export default function CrearUsuarioForm() {
  const [estado, formAction, pendiente] = useActionState(
    crearUsuario,
    estadoInicial
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="nombre"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Nombre completo"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label
          htmlFor="rol"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Rol
        </label>
        <select
          id="rol"
          name="rol"
          defaultValue="EMPLEADO"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="EMPLEADO">Empleado</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      {estado.mensaje && (
        <p
          role="status"
          aria-live="polite"
          className={`rounded-md px-3 py-2 text-sm ${
            estado.ok
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {estado.mensaje}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-md bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
      >
        {pendiente ? "Guardando..." : "Guardar usuario"}
      </button>
    </form>
  );
}
