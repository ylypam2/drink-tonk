require("dotenv/config");

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function crearUsuariosIniciales() {
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

  console.log("Usuarios iniciales creados o actualizados correctamente:");
  console.log({
    administrador: {
      id: administrador.id,
      nombre: administrador.nombre,
      email: administrador.email,
      rol: administrador.rol,
    },
    empleado: {
      id: empleado.id,
      nombre: empleado.nombre,
      email: empleado.email,
      rol: empleado.rol,
    },
  });
}

crearUsuariosIniciales()
  .catch((error) => {
    console.error("Error al crear los usuarios iniciales:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
