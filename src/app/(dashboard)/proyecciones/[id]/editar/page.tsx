import ProjectionForm from "@/components/ProjectionForm"
import { getClients } from "@/app/(dashboard)/proyecciones/actions"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditProjectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const projection = await prisma.cashFlowProjection.findUnique({
    where: { id }
  })

  if (!projection) {
    notFound()
  }

  if (projection.isReconciled) {
    redirect("/proyecciones")
  }

  const clients = await getClients()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Editar Proyección</h1>
          <p className="text-gray-500 mt-1">Modifica los detalles del flujo proyectado.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <ProjectionForm clients={clients} projection={projection} />
        </div>
        
      </div>
    </div>
  )
}
