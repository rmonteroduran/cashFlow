import Sidebar from "@/components/Sidebar"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma";

import DashboardLayoutClient from "./DashboardLayoutClient"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let branding = null;
  try {
    branding = await prisma.companyBranding.findFirst();
  } catch (e) {
    console.error(e);
  }

  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const userRole = (session.user as any)?.role || "ANALYST"

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardLayoutClient 
        logoUrl={branding?.logoUrl} 
        userRole={userRole} 
        aiEnabled={branding?.aiEnabled ?? false}
      >
        {children}
      </DashboardLayoutClient>
    </div>
  )
}
