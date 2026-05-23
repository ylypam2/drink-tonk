// app/empleado/page.tsx
import { redirect } from "next/navigation";
import { requireEmpleadoOAdmin } from "@/lib/auth";

export default async function EmpleadoPage() {
  const sesion = await requireEmpleadoOAdmin();

  if (!sesion) {
    redirect("/login");
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Panel del empleado
      </h1>
      <p className="text-gray-600">
        Bienvenido, {sesion.nombre}. Desde aquí luego montaremos ventas, compras e inventario.
      </p>
    </div>
  );
}