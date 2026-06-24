# Configuración de Prisma con PostgreSQL

## Instalación

```bash
pnpm install
```

## Configuración de la base de datos

Agrega la variable de entorno en tu archivo `.env.local`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/drink_tonk?schema=public"
```

## Migraciones

Crear la base de datos y aplicar las migraciones:

```bash
npx prisma migrate dev --name init
```

## Generar cliente de Prisma

```bash
npx prisma generate
```

## Ver esquema en Prisma Studio

```bash
npx prisma studio
```

## Modelos creados

- **Usuario**: Usuarios del sistema (admin/empleado)
- **Producto**: Productos del inventario
- **Compra**: Compras de productos (con detalles)
- **Venta**: Ventas de productos (con detalles)
- **CompraDetalle**: Detalles de cada compra
- **VentaDetalle**: Detalles de cada venta

## Relaciones

- Usuario tiene muchas Compras y Ventas
- Producto tiene muchos CompraDetalle y VentaDetalle
- Compra tiene muchos CompraDetalle
- Venta tiene muchos VentaDetalle
