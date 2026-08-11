"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getAllowedDomains() {
  return await prisma.allowedDomain.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createAllowedDomain(formData: FormData) {
  let domain = formData.get('domain') as string
  
  if (!domain) {
    return { error: "El dominio es requerido." }
  }

  // Remove @ if user included it
  domain = domain.trim().toLowerCase()
  if (domain.startsWith('@')) {
    domain = domain.substring(1)
  }

  const existing = await prisma.allowedDomain.findUnique({
    where: { domain }
  })

  if (existing) {
    return { error: "Este dominio ya se encuentra registrado." }
  }

  await prisma.allowedDomain.create({
    data: { domain }
  })

  revalidatePath('/admin/security')
  return { success: true }
}

export async function toggleDomainStatus(id: string, isActive: boolean) {
  await prisma.allowedDomain.update({
    where: { id },
    data: { isActive }
  })

  revalidatePath('/admin/security')
  return { success: true }
}

export async function deleteAllowedDomain(id: string) {
  await prisma.allowedDomain.delete({
    where: { id }
  })

  revalidatePath('/admin/security')
  return { success: true }
}
