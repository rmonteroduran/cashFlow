import { getClients } from "../actions"
import ProjectionForm from "@/components/ProjectionForm"

export const dynamic = 'force-dynamic'

export default async function NuevaProyeccionPage() {
  const clients = await getClients()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Proyección</h1>
          <p className="text-gray-500 mt-1">Registra un nuevo ingreso o egreso en el flujo de caja.</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <ProjectionForm clients={clients} />
        </div>
      </div>
    </div>
  )
}
