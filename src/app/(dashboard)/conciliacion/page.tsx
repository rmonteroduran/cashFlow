import { getPendingTransactions, getPendingProjections, getBankAccounts } from "./actions"
import ConciliacionClient from "./ConciliacionClient"

export const dynamic = 'force-dynamic'

export default async function ConciliacionPage() {
  const [transactions, projections, bankAccounts] = await Promise.all([
    getPendingTransactions(),
    getPendingProjections(),
    getBankAccounts()
  ])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Conciliación Bancaria</h1>
          <p className="text-gray-500 mt-1">Sube tus extractos bancarios y enlázalos con las proyecciones del flujo de caja.</p>
        </header>

        <ConciliacionClient 
          transactions={transactions} 
          projections={projections} 
          bankAccounts={bankAccounts}
        />
      </div>
    </div>
  )
}
