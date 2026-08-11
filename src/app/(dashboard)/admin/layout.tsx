import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const userRole = (session?.user as any)?.role

  if (userRole !== "ADMIN" && userRole !== "ADMIN_MANAGER") {
    redirect("/")
  }

  return <>{children}</>
}
