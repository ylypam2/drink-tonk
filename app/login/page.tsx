"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UsuarioSesion = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
};

type RespuestaLogin = {
  success: boolean;
  error?: string;
  usuario?: UsuarioSesion;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const resultado: RespuestaLogin = await respuesta.json();

      if (!respuesta.ok || !resultado.success || !resultado.usuario) {
        setError(
          resultado.error ??
            "No fue posible iniciar sesión. Verifica tus credenciales."
        );
        return;
      }

      window.localStorage.removeItem("drink_tonk_usuario");

      const rol = resultado.usuario.rol;
      const returnTo = window.localStorage.getItem("drink_tonk_returnTo");
      window.localStorage.removeItem("drink_tonk_returnTo");

      if (returnTo === "/ventas" && (rol === "ADMIN" || rol === "EMPLEADO")) {
        router.push("/ventas");
      } else if (rol === "ADMIN") {
        router.push("/admin");
      } else if (rol === "EMPLEADO") {
        router.push("/empleado");
      } else {
        setError("Rol de usuario no reconocido. Contacte al administrador.");
        return;
      }
      router.refresh();
    } catch {
      setError(
        "No fue posible conectar con el servidor. Intenta nuevamente."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef4ff] px-4 py-8 sm:px-6 lg:px-10">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2563eb]">
                Drink Tonk
              </p>

              <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                Bienvenido de nuevo
              </h1>

              <p className="mt-3 text-slate-600">
                Ingresa con tu correo electrónico y contraseña para acceder al
                sistema de gestión del mini market.
              </p>
            </div>

            <form onSubmit={manejarEnvio} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  autoComplete="email"
                  disabled={cargando}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Contraseña
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(evento) => setPassword(evento.target.value)}
                  placeholder="Ingresa tu contraseña"
                  required
                  autoComplete="current-password"
                  disabled={cargando}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#2563eb] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-xl bg-[#2563eb] px-4 py-3 font-semibold text-white shadow-md transition hover:bg-[#1d4ed8] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {cargando ? "Validando acceso..." : "Entrar al sistema"}
              </button>
            </form>

            <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-[#1d4ed8]">
                Usuarios de prueba
              </p>

              <p className="mt-1">
                Inicia sesión con las credenciales asignadas para administrador
                o empleado.
              </p>
            </div>
          </div>
        </div>

        <aside className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#60a5fa] px-8 py-12 lg:min-h-full">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-cyan-300/20" />

          <div className="relative z-10 flex max-w-md flex-col items-center text-center text-white">
            <div className="rounded-3xl bg-white/95 p-5 shadow-2xl">
              <Image
                src="/logo-drink-tonk.jpeg"
                alt="Logo de Drink Tonk"
                width={300}
                height={300}
                priority
                className="h-auto w-52 object-contain sm:h-auto sm:w-64"
              />
            </div>

            <h2 className="mt-8 text-3xl font-bold">
              Drink Tonk
            </h2>

            <p className="mt-3 max-w-sm text-base leading-7 text-blue-50">
              Gestiona productos, compras, ventas e inventario desde una sola
              plataforma.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}