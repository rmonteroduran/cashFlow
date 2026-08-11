import { getBranding } from "./actions"
import BrandingForm from "@/components/BrandingForm"

export const dynamic = 'force-dynamic'

export default async function BrandingPage() {
  const branding = await getBranding()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
          <p className="text-gray-500">
            Personaliza la apariencia de cashflow para que coincida con la identidad corporativa de tu empresa.
            Los cambios se aplicarán inmediatamente en todas las interfaces de los usuarios
          </p>
        </header>

        <main>
          <BrandingForm initialData={branding} />
        </main>
      </div>
    </div>
  )
}
