import { getClients } from "@/app/(dashboard)/proyecciones/actions"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const clients = await getClients()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Directorio de Clientes</h1>
            <p className="text-gray-500 mt-1">Configura las alícuotas impositivas para automatizar el flujo de caja.</p>
          </div>
          <Link href="/clientes/nuevo" className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg font-medium shadow-sm hover:opacity-90 transition-opacity">
            + Nuevo Cliente
          </Link>
        </header>

        {/* Clients Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4 text-right">Alícuota IIBB</th>
                  <th className="px-6 py-4 text-right">Ganancias</th>
                  <th className="px-6 py-4 text-right">IVA</th>
                  <th className="px-6 py-4 text-right">SUSS</th>
                  <th className="px-6 py-4 text-right">Total Retención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No hay clientes registrados.
                    </td>
                  </tr>
                ) : (
                  clients.map(client => {
                    const totalRetenciones = (client.taxRateIIBB + client.taxRateGanancias + client.taxRateIVA + client.taxRateSUSS).toFixed(2);
                    return (
                      <tr key={client.id} className="hover:bg-gray-50/50 cursor-pointer transition-colors">
                        <td className="px-6 py-4 text-gray-900 font-medium">{client.name}</td>
                        <td className="px-6 py-4 text-right">{client.taxRateIIBB.toFixed(2)}%</td>
                        <td className="px-6 py-4 text-right">{client.taxRateGanancias.toFixed(2)}%</td>
                        <td className="px-6 py-4 text-right">{client.taxRateIVA.toFixed(2)}%</td>
                        <td className="px-6 py-4 text-right">{client.taxRateSUSS.toFixed(2)}%</td>
                        <td className="px-6 py-4 text-right text-gray-900 font-semibold">{totalRetenciones}%</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
