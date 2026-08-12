"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CategoryType } from "@prisma/client"

export async function getClients() {
  return prisma.client.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function createClient(data: { name: string; cuit: string; taxRateIIBB?: number; taxRateGanancias?: number; taxRateIVA?: number; taxRateSUSS?: number }) {
  if (!data.cuit) throw new Error("El CUIT es obligatorio");
  if (!/^\d+$/.test(data.cuit)) throw new Error("El CUIT debe ser numérico");

  const existing = await prisma.client.findUnique({ where: { cuit: data.cuit } });
  if (existing) throw new Error("Ya existe un cliente con este CUIT");

  const client = await prisma.client.create({ data })
  revalidatePath("/clientes")
  revalidatePath("/proyecciones")
  return client
}

export async function updateClient(id: string, data: { name: string; cuit: string; taxRateIIBB?: number; taxRateGanancias?: number; taxRateIVA?: number; taxRateSUSS?: number }) {
  if (!data.cuit) throw new Error("El CUIT es obligatorio");
  if (!/^\d+$/.test(data.cuit)) throw new Error("El CUIT debe ser numérico");

  const existing = await prisma.client.findUnique({ where: { cuit: data.cuit } });
  if (existing && existing.id !== id) throw new Error("Ya existe otro cliente con este CUIT");

  const client = await prisma.client.update({
    where: { id },
    data
  })
  revalidatePath("/clientes")
  revalidatePath("/proyecciones")
  return client
}

export async function deleteClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { projections: true }
  })

  if (!client) throw new Error("El cliente no existe");
  if (client.projections.length > 0) {
    throw new Error("No se puede eliminar el cliente porque tiene proyecciones asociadas.");
  }

  await prisma.client.delete({
    where: { id }
  })
  
  revalidatePath("/clientes")
  revalidatePath("/proyecciones")
}

export async function getProjections() {
  return prisma.cashFlowProjection.findMany({
    include: { client: true, vendor: true, category: true },
    orderBy: { date: 'asc' }
  })
}

export async function createProjection(data: {
  date: Date;
  description: string;
  amount: number;
  type: CategoryType;
  clientId?: string;
  vendorId?: string;
  categoryId?: string;
}) {
  let netAmount = data.amount;

  // Si es un ingreso y está asociado a un cliente, calcular el neto
  if (data.type === "INCOME" && data.clientId) {
    const client = await prisma.client.findUnique({ where: { id: data.clientId } })
    if (client) {
      const totalDeductions = (client.taxRateIIBB + client.taxRateGanancias + client.taxRateIVA + client.taxRateSUSS) / 100;
      netAmount = data.amount * (1 - totalDeductions);
    }
  }

  const projection = await prisma.cashFlowProjection.create({
    data: {
      ...data,
      netAmount
    }
  })

  revalidatePath("/proyecciones")
  return projection
}

export async function updateProjection(id: string, data: {
  date: Date;
  description: string;
  amount: number;
  type: CategoryType;
  currency: "ARS" | "USD";
  clientId?: string;
  vendorId?: string;
  categoryId?: string;
}) {
  const existing = await prisma.cashFlowProjection.findUnique({ where: { id } });
  if (!existing) throw new Error("Proyección no encontrada");
  if (existing.isReconciled) throw new Error("No se pueden editar proyecciones conciliadas");

  let netAmount = data.amount;

  if (data.type === "INCOME" && data.clientId) {
    const client = await prisma.client.findUnique({ where: { id: data.clientId } })
    if (client) {
      const totalDeductions = (client.taxRateIIBB + client.taxRateGanancias + client.taxRateIVA + client.taxRateSUSS) / 100;
      netAmount = data.amount * (1 - totalDeductions);
    }
  }

  const projection = await prisma.cashFlowProjection.update({
    where: { id },
    data: {
      ...data,
      netAmount
    }
  })

  revalidatePath("/proyecciones")
  revalidatePath("/")
  return projection
}

export async function deleteProjection(id: string) {
  const existing = await prisma.cashFlowProjection.findUnique({ where: { id } });
  if (!existing) throw new Error("Proyección no encontrada");
  if (existing.isReconciled) throw new Error("No se pueden eliminar proyecciones conciliadas");

  await prisma.cashFlowProjection.delete({
    where: { id }
  })
  
  revalidatePath("/proyecciones")
  revalidatePath("/")
}
