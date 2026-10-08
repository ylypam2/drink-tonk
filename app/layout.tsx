import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

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
        <Navbar />

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