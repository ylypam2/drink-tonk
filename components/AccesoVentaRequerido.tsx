"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccesoVentaRequerido() {
  const router = useRouter();

  function iniciarSesion() {
    window.localStorage.setItem("drink_tonk_returnTo", "/ventas");
    router.push("/login");
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-amber-900">
          Finalizar venta
        </h1>

        <p className="mt-3 text-amber-800">
          La finalización de esta venta requiere acceso de empleado o
          administrador.
        </p>

        <p className="mt-2 text-sm text-amber-700">
          Tu carrito se conservará. Después de iniciar sesión volverás a esta
          página para continuar.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={iniciarSesion}
            className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Iniciar sesión
          </button>

          <Link
            href="/productos"
            className="rounded-md border border-amber-300 px-6 py-2 font-semibold text-amber-900 hover:bg-amber-100"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
