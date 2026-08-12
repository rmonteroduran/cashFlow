"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Currency } from "@prisma/client"

export async function createAccount(data: { name: string, currency: Currency, initialBalance: number }) {
  await prisma.bankAccount.create({
    data: {
      name: data.name,
      currency: data.currency,
      initialBalance: data.initialBalance
    }
  })
  revalidatePath("/")
  revalidatePath("/cuentas")
}

export async function updateAccount(id: string, data: { name?: string, initialBalance?: number }) {
  await prisma.bankAccount.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.initialBalance !== undefined && { initialBalance: data.initialBalance })
    }
  })
  revalidatePath("/")
  revalidatePath("/cuentas")
}

export async function deleteAccount(id: string) {
  await prisma.bankAccount.delete({
    where: { id }
  })
  revalidatePath("/")
  revalidatePath("/cuentas")
}

export async function createInvestment(data: {
  name: string
  entity: string
  instrumentType: string
  termDays?: number
  returnRate?: number
  amount: number
  currency: Currency
}) {
  await prisma.investment.create({
    data
  })
  revalidatePath("/")
  revalidatePath("/cuentas")
}

export async function updateInvestment(id: string, data: any) {
  await prisma.investment.update({
    where: { id },
    data
  })
  revalidatePath("/")
  revalidatePath("/cuentas")
}

export async function deleteInvestment(id: string) {
  await prisma.investment.delete({
    where: { id }
  })
  revalidatePath("/")
  revalidatePath("/cuentas")
}
