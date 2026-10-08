import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({
  path: ".env.local",
});

async function main() {
  const { prisma } = await import("../lib/prisma");

  const passwordAdministrador = await bcrypt.hash("AdminDrink2026!", 10);
  const passwordEmpleado = await bcrypt.hash("EmpleadoDrink2026!", 10);

  const administrador = await prisma.usuario.upsert({
    where: {
      email: "admin@drinktonk.com",
    },
    update: {
      nombre: "Administrador Drink Tonk",
      password: passwordAdministrador,
      rol: "ADMIN",
      estado: true,
    },
    create: {
      nombre: "Administrador Drink Tonk",
      email: "admin@drinktonk.com",
      password: passwordAdministrador,
      rol: "ADMIN",
      estado: true,
    },
  });

  const empleado = await prisma.usuario.upsert({
    where: {
      email: "empleado@drinktonk.com",
    },
    update: {
      nombre: "Empleado Drink Tonk",
      password: passwordEmpleado,
      rol: "EMPLEADO",
      estado: true,
    },
    create: {
      nombre: "Empleado Drink Tonk",
      email: "empleado@drinktonk.com",
      password: passwordEmpleado,
      rol: "EMPLEADO",
      estado: true,
    },
  });

  console.table([
    {
      rol: administrador.rol,
      nombre: administrador.nombre,
      email: administrador.email,
      id: administrador.id,
    },
    {
      rol: empleado.rol,
      nombre: empleado.nombre,
      email: empleado.email,
      id: empleado.id,
    },
  ]);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error al crear usuarios iniciales:", error);
  process.exitCode = 1;
});
