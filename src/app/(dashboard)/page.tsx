import { Activity } from "lucide-react"

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Inicio</h1>
            <p className="text-gray-500 mt-1">Bienvenido a cashFlow</p>
          </div>
        </header>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Actividad Reciente" 
            value={"0"} 
            icon={<Activity className="w-6 h-6 text-green-500" />} 
            trend="Sin datos"
          />
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
