import { prisma } from "@/lib/prisma"
import { getServerSession } from "next/cache"
// If auth is needed: import { authOptions } from "@/app/api/auth/[...nextauth]/route"
// import { redirect } from "next/navigation"
import { CuentasClient } from "./CuentasClient"

export const dynamic = 'force-dynamic'

export default async function CuentasPage() {
  // Fetch bank accounts with their transactions to calculate actual balances
  const accounts = await prisma.bankAccount.findMany({
    include: {
      transactions: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Fetch investments
  const investments = await prisma.investment.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <CuentasClient accounts={accounts} investments={investments} />
      </div>
    </div>
  )
}
