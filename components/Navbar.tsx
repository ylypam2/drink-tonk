"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UsuarioSesion = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
};

const enlacesOperativos = [
  { href: "/", texto: "Inicio" },
  { href: "/productos", texto: "Productos" },
  { href: "/compras", texto: "Registrar compra" },
  { href: "/ventas", texto: "Registrar venta" },
  { href: "/contacto", texto: "Contacto" },
];

const enlacesAdministrador = [
  ...enlacesOperativos,
  { href: "/admin", texto: "Administración" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    const sesionGuardada = window.localStorage.getItem("drink_tonk_usuario");

    if (!sesionGuardada) {
      return;
    }

    try {
      setUsuario(JSON.parse(sesionGuardada));
    } catch {
      window.localStorage.removeItem("drink_tonk_usuario");
    }
  }, []);

  async function cerrarSesion() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("No fue posible cerrar la sesión:", error);
    }

    window.localStorage.removeItem("drink_tonk_usuario");
    setUsuario(null);

    router.replace("/login");
  }

  const enlaces =
    usuario?.rol === "ADMIN"
      ? enlacesAdministrador
      : enlacesOperativos;

  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="bg-[#2563eb] text-white shadow-md">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-bold tracking-wide transition hover:text-blue-100"
        >
          <img
            src="/logo-drink-tonk.jpeg"
            alt="Logo Drink Tonk"
            className="h-9 w-9 rounded-full bg-white object-contain p-1"
          />

          <span>Drink Tonk</span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium">
          {enlaces.map((enlace) => {
            const estaActivo = pathname === enlace.href;

            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                className={
                  estaActivo
                    ? "font-bold text-white underline underline-offset-4"
                    : "text-blue-100 transition hover:text-white hover:underline"
                }
              >
                {enlace.texto}
              </Link>
            );
          })}

          {usuario ? (
            <>
              <span className="hidden border-l border-blue-400 pl-4 text-xs text-blue-100 lg:inline">
                {usuario.nombre}
              </span>

              <button
                type="button"
                onClick={cerrarSesion}
                className="rounded-md border border-blue-200 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white hover:text-blue-700"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-blue-200 px-3 py-1.5 font-semibold text-white transition hover:bg-white hover:text-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
