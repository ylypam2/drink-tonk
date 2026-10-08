import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Creando usuarios iniciales...");

  // Hash de contraseñas
  const adminPassword = await bcrypt.hash("admin123", 10);
  const empleadoPassword = await bcrypt.hash("empleado123", 10);

  // Crear usuario administrador
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@drinktonk.com" },
    update: {},
    create: {
      nombre: "Administrador",
      email: "admin@drinktonk.com",
      password: adminPassword,
      rol: "ADMIN",
      estado: true,
    },
  });

  console.log("✅ Usuario administrador creado:", admin.email);

  // Crear usuario empleado
  const empleado = await prisma.usuario.upsert({
    where: { email: "empleado@drinktonk.com" },
    update: {},
    create: {
      nombre: "Empleado",
      email: "empleado@drinktonk.com",
      password: empleadoPassword,
      rol: "EMPLEADO",
      estado: true,
    },
  });

  console.log("✅ Usuario empleado creado:", empleado.email);

  console.log("🎉 Usuarios iniciales creados exitosamente");
}

main()
  .catch((e) => {
    console.error("❌ Error al crear usuarios:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
