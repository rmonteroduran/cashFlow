import { Activity, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react"
import { CashFlowChart } from "@/components/DashboardCharts"
import PrintButton from "@/components/PrintButton"
import { MonthYearFilter } from "@/components/MonthYearFilter"

export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function DashboardPage(props: { searchParams: Promise<{ month?: string, year?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role

  if (userRole === "ADMIN") {
    redirect("/admin/security")
  }

  // Obtener datos reales de la BD
  const now = new Date()
  let selectedMonth = now.getMonth();
  let selectedYear = now.getFullYear();
  
  if (searchParams.month) selectedMonth = parseInt(searchParams.month, 10) - 1;
  if (searchParams.year) selectedYear = parseInt(searchParams.year, 10);

  const startOfMonth = new Date(selectedYear, selectedMonth, 1)
  const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999)

  const [transactions, currentMonthProjections] = await Promise.all([
    prisma.transaction.findMany({ include: { bankAccount: true } }),
    prisma.cashFlowProjection.findMany({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    })
  ])

  // Saldo total actual (separando inversiones y monedas)
  let realBalanceARS = 0;
  let realBalanceUSD = 0;
  let investedARS = 0;
  let investedUSD = 0;

  transactions.forEach(t => {
    const isInvestment = t.bankAccount.name.toLowerCase().includes('inversion') || t.bankAccount.name.toLowerCase().includes('inversión');
    if (t.bankAccount.currency === 'ARS') {
      if (isInvestment) investedARS += t.amount;
      else realBalanceARS += t.amount;
    } else if (t.bankAccount.currency === 'USD') {
      if (isInvestment) investedUSD += t.amount;
      else realBalanceUSD += t.amount;
    }
  });

  // Ingresos Proyectados Mes Actual
  const projectedIncomeARS = currentMonthProjections
    .filter(p => p.type === 'INCOME' && p.currency === 'ARS')
    .reduce((acc, p) => acc + p.netAmount, 0)
    
  const projectedIncomeUSD = currentMonthProjections
    .filter(p => p.type === 'INCOME' && p.currency === 'USD')
    .reduce((acc, p) => acc + p.netAmount, 0)

  // Egresos Proyectados Mes Actual
  const projectedExpenseARS = currentMonthProjections
    .filter(p => p.type === 'EXPENSE' && p.currency === 'ARS')
    .reduce((acc, p) => acc + p.netAmount, 0)
    
  const projectedExpenseUSD = currentMonthProjections
    .filter(p => p.type === 'EXPENSE' && p.currency === 'USD')
    .reduce((acc, p) => acc + p.netAmount, 0)

  // Preparar datos para el gráfico (Agrupado por semana)
  const lastDay = endOfMonth.getDate()
  
  const weeksData = [
    { name: "Semana 1\n(1-7)", ingresos: 0, egresos: 0 },
    { name: "Semana 2\n(8-14)", ingresos: 0, egresos: 0 },
    { name: "Semana 3\n(15-21)", ingresos: 0, egresos: 0 },
    { name: "Semana 4\n(22-28)", ingresos: 0, egresos: 0 },
  ]

  if (lastDay > 28) {
    weeksData.push({ name: `Semana 5\n(29-${lastDay})`, ingresos: 0, egresos: 0 })
  }
  
  currentMonthProjections.forEach(p => {
    const day = p.date.getDate()
    const weekIndex = Math.floor((day - 1) / 7)

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
          <div className="flex gap-4">
            <MonthYearFilter />
            <PrintButton />
          </div>
        </header>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard 
            title="Saldo Real en Banco" 
            value={`ARS $${realBalanceARS.toLocaleString()}`} 
            valueUSD={`USD $${realBalanceUSD.toLocaleString()}`}
            icon={<Wallet className="w-6 h-6 text-blue-500" />} 
            trend="Total histórico"
          />
          <MetricCard 
            title="Total Invertido" 
            value={`ARS $${investedARS.toLocaleString()}`} 
            valueUSD={`USD $${investedUSD.toLocaleString()}`}
            icon={<Activity className="w-6 h-6 text-purple-500" />} 
            trend="En cuentas de inversión"
          />
          <MetricCard 
            title="Ingresos Proyectados" 
            value={`ARS $${projectedIncomeARS.toLocaleString()}`} 
            valueUSD={`USD $${projectedIncomeUSD.toLocaleString()}`}
            icon={<ArrowUpCircle className="w-6 h-6 text-green-500" />} 
            trend="Mes Seleccionado"
          />
          <MetricCard 
            title="Egresos Proyectados" 
            value={`ARS $${projectedExpenseARS.toLocaleString()}`} 
            valueUSD={`USD $${projectedExpenseUSD.toLocaleString()}`}
            icon={<ArrowDownCircle className="w-6 h-6 text-red-500" />} 
            trend="Mes Seleccionado"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Proyecciones del Mes Seleccionado</h2>
          <CashFlowChart data={weeksData} />
        </div>

      </div>
    </div>
  )
}

function MetricCard({ title, value, valueUSD, icon, trend }: { title: string, value: string | number, valueUSD?: string | number, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-xl">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {valueUSD !== undefined && (
          <p className="text-lg font-semibold text-gray-700 mt-1">{valueUSD}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">{trend}</p>
      </div>
    </div>
  )
}
