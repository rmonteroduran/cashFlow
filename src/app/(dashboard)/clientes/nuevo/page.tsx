import ClientForm from "@/components/ClientForm"

export default function NuevoClientePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Cliente</h1>
          <p className="text-gray-500 mt-1">Registra un cliente y configura sus retenciones impositivas.</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <ClientForm />
        </div>
      </div>
    </div>
  )
}
