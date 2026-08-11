import { getProjections, getClients } from "./actions"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ProyeccionesPage() {
  const projections = await getProjections()
  const clients = await getClients()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proyecciones de Flujo de Caja</h1>
            <p className="text-gray-500 mt-1">Gestiona ingresos previstos y egresos recurrentes.</p>
          </div>
          <Link href="/proyecciones/nueva" className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg font-medium shadow-sm hover:opacity-90 transition-opacity">
            + Nueva Proyección
          </Link>
        </header>

        {/* Projections Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Cliente/Prov.</th>
                  <th className="px-6 py-4 text-right">Monto Bruto</th>
                  <th className="px-6 py-4 text-right">Monto Neto</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No hay proyecciones registradas.
                    </td>
                  </tr>
                ) : (
                  projections.map(proj => (
                    <tr key={proj.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {new Date(proj.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{proj.description}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          proj.type === 'INCOME' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {proj.type === 'INCOME' ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {proj.client?.name || proj.vendor?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        ${proj.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        ${proj.netAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {proj.isReconciled ? (
                          <span className="text-green-600 font-medium text-xs">Conciliado</span>
                        ) : (
                          <span className="text-amber-500 font-medium text-xs">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  )
}
