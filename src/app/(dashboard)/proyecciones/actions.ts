"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CategoryType } from "@prisma/client"

export async function getClients() {
  return prisma.client.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function createClient(data: { name: string; taxRateIIBB?: number; taxRateGanancias?: number; taxRateIVA?: number; taxRateSUSS?: number }) {
  const client = await prisma.client.create({ data })
  revalidatePath("/proyecciones")
  return client
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
