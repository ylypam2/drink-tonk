'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { exigirAdministrador } from '@/lib/autorizacion'

export async function crearProveedor(formData: FormData) {
  await exigirAdministrador()

  const nombre = formData.get('nombre') as string
  const identificacion = formData.get('identificacion') as string
  const contacto = formData.get('contacto') as string
  const telefono = formData.get('telefono') as string

  if (!nombre) {
    throw new Error('El nombre es requerido')
  }

  if (!identificacion) {
    throw new Error('La identificación es requerida')
  }

  await prisma.proveedor.create({
    data: {
      nombre,
      identificacion,
      contacto: contacto || null,
      telefono: telefono || null,
    },
  })

  redirect('/admin/proveedores')
}
