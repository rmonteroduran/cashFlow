import { Activity, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react"
import { CashFlowChart } from "@/components/DashboardCharts"
import PrintButton from "@/components/PrintButton"

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role

  if (userRole === "ADMIN") {
    redirect("/admin/security")
  }

  // Obtener datos reales de la BD
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [transactions, currentMonthProjections] = await Promise.all([
    prisma.transaction.findMany(),
    prisma.cashFlowProjection.findMany({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    })
  ])

  // Saldo total actual (suma de todas las transacciones reales en el banco)
  const realBalance = transactions.reduce((acc, t) => acc + t.amount, 0)

  // Ingresos Proyectados Mes Actual
  const projectedIncome = currentMonthProjections
    .filter(p => p.type === 'INCOME')
    .reduce((acc, p) => acc + p.netAmount, 0)

  // Egresos Proyectados Mes Actual
  const projectedExpense = currentMonthProjections
    .filter(p => p.type === 'EXPENSE')
    .reduce((acc, p) => acc + p.netAmount, 0)

  // Preparar datos para el gráfico (Agrupado por semana)
  const weeksData = [
    { name: "Semana 1", ingresos: 0, egresos: 0 },
    { name: "Semana 2", ingresos: 0, egresos: 0 },
    { name: "Semana 3", ingresos: 0, egresos: 0 },
    { name: "Semana 4", ingresos: 0, egresos: 0 },
  ]
  
  currentMonthProjections.forEach(p => {
    const day = p.date.getDate()
    let weekIndex = Math.floor((day - 1) / 7)
    if (weekIndex > 3) weekIndex = 3 // Agrupar últimos días en la semana 4

    if (p.type === 'INCOME') {
      weeksData[weekIndex].ingresos += p.netAmount
    } else {
      weeksData[weekIndex].egresos += p.netAmount
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Inicio</h1>
            <p className="text-gray-500 mt-1">Resumen financiero y estado de caja real.</p>
          </div>
          <PrintButton />
        </header>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            title="Saldo Real en Banco" 
            value={`$${realBalance.toLocaleString()}`} 
            icon={<Wallet className="w-6 h-6 text-blue-500" />} 
            trend="Total histórico"
          />
          <MetricCard 
            title="Ingresos Proyectados (Mes)" 
            value={`$${projectedIncome.toLocaleString()}`} 
            icon={<ArrowUpCircle className="w-6 h-6 text-green-500" />} 
            trend="Pendientes + Conciliados"
          />
          <MetricCard 
            title="Egresos Proyectados (Mes)" 
            value={`$${projectedExpense.toLocaleString()}`} 
            icon={<ArrowDownCircle className="w-6 h-6 text-red-500" />} 
            trend="Pendientes + Conciliados"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Proyecciones del Mes Actual</h2>
          <CashFlowChart data={weeksData} />
        </div>

      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-xl">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-2">{trend}</p>
      </div>
    </div>
  )
}
