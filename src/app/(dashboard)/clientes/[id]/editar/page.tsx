import ClientForm from "@/components/ClientForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const client = await prisma.client.findUnique({
    where: { id }
  })

  if (!client) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-gray-500 mt-1">Actualiza los datos y alícuotas del cliente.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <ClientForm client={client} />
        </div>
        
      </div>
    </div>
  )
}
