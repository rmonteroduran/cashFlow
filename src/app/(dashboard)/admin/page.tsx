import { getUsers } from "./actions"
import UsersManager from "@/components/UsersManager"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const users = await getUsers()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <header>
          <h1 className="text-3xl font-bold text-gray-900">Administración</h1>
          <p className="text-gray-500 mt-1">Control de accesos y roles del sistema</p>
        </header>

        <main>
          <UsersManager initialUsers={users} />
        </main>

      </div>
    </div>
  )
}
