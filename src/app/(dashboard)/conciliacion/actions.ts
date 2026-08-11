"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day, 12, 0, 0);
      if (!isNaN(d.getTime())) return d;
    } else {
      // DD/MM/YYYY
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const d = new Date(year, month, day, 12, 0, 0);
      if (!isNaN(d.getTime())) return d;
    }
  }
  
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    d.setHours(12, 0, 0);
    return d;
  }
  return null;
}

export async function processBankStatement(csvText: string, bankAccountId: string) {
  const lines = csvText.split('\n').filter(line => line.trim() !== '')
  const transactionsData = []

  // Skip header, assuming first line is header
  for (let i = 1; i < lines.length; i++) {
    // split by comma, ignoring commas inside quotes
    const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) || lines[i].split(',').map(c => c.trim())
    
    if (cols.length >= 3) {
      const date = parseDate(cols[0])
      const description = cols[1]
      
      // Clean amount: remove quotes, spaces, replacing commas with dots if they are used as decimal separators, 
      // but if the amount is like 1.500,00 we need to be careful.
      // Assuming US format or simple numbers for MVP:
      let amountStr = cols[2].replace(/[^0-9\.\-]/g, '')
      const amount = parseFloat(amountStr)

      if (date && !isNaN(amount)) {
        transactionsData.push({
          date,
          description,
          amount,
          bankAccountId,
          isReconciled: false
        })
      }
    }
  }

  // Save to DB
  let createdCount = 0
  for (const data of transactionsData) {
    await prisma.transaction.create({ data })
    createdCount++
  }

  revalidatePath("/conciliacion")
  return { success: true, count: createdCount }
}

export async function getPendingTransactions() {
  return prisma.transaction.findMany({
    where: { isReconciled: false },
    orderBy: { date: 'asc' }
  })
}

export async function getPendingProjections() {
  return prisma.cashFlowProjection.findMany({
    where: { isReconciled: false },
    orderBy: { date: 'asc' }
  })
}

export async function reconcile(transactionId: string, projectionId: string) {
  // Match them
  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transactionId },
      data: { isReconciled: true }
    }),
    prisma.cashFlowProjection.update({
      where: { id: projectionId },
      data: { isReconciled: true }
    })
  ])

  revalidatePath("/conciliacion")
  return { success: true }
}

export async function getBankAccounts() {
  // Create a default one if none exists (for MVP)
  let accounts = await prisma.bankAccount.findMany()
  if (accounts.length === 0) {
    const defaultAcc = await prisma.bankAccount.create({
      data: { name: "Cuenta Principal", currency: "ARS" }
    })
    accounts = [defaultAcc]
  }
  return accounts
}

export async function clearUnreconciledTransactions() {
  await prisma.transaction.deleteMany({
    where: { isReconciled: false }
  })
  revalidatePath("/conciliacion")
  return { success: true }
}
