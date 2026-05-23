import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css"; // Asegúrate de que esta línea exista para mantener los estilos

export const metadata: Metadata = {
  title: "Drink Tonk",
  description: "Sistema web para mini market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {/* BARRA DE NAVEGACIÓN */}
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold tracking-wider">
              🍹 Drink Tonk
            </Link>
            <div className="space-x-4">
              <Link href="/productos" className="hover:underline">Productos</Link>
              <Link href="/contacto" className="hover:underline">Contacto</Link>
              <Link href="/admin" className="hover:underline">Admin</Link>
              <Link href="/login" className="hover:underline text-blue-200 font-semibold">Login</Link>
            </div>
          </div>
        </nav>

        {/* CONTENIDO DE LAS PÁGINAS */}
        <main className="flex-grow max-w-6xl w-full mx-auto p-6">
          {children}
        </main>

        {/* PIE DE PÁGINA */}
        <footer className="bg-gray-800 text-gray-400 text-center p-4 text-sm mt-auto">
          &copy; {new Date().getFullYear()} Drink Tonk - Sistema de Gestión
        </footer>
      </body>
    </html>
  );
}