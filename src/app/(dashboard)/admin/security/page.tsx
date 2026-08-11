import { getAllowedDomains } from "./actions"
import SecurityForm from "./SecurityForm"
import { getUsers } from "../actions"
import UsersManager from "@/components/UsersManager"
import { getBranding } from "../branding/actions"
import AiConfigForm from "./AiConfigForm"

export const dynamic = 'force-dynamic'

export default async function SecurityPage() {
  const domains = await getAllowedDomains()
  const users = await getUsers()
  const branding = await getBranding()
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguridad y Accesos</h1>
        <p className="text-gray-500">
          Administra las reglas de acceso a la plataforma. Define qué dominios están autorizados 
          para el inicio de sesión único (SSO) de la organización.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <SecurityForm initialDomains={domains} />
        </section>

        <section>
          <UsersManager initialUsers={users} />
        </section>

        <section>
          <AiConfigForm initialData={branding} />
        </section>
      </div>
    </div>
  )
}

