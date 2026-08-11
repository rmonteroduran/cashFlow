"use client"

import { useState } from "react"
import Sidebar from "@/components/Sidebar"

export default function DashboardLayoutClient({
  children,
  logoUrl,
  userRole,
  aiEnabled
}: {
  children: React.ReactNode,
  logoUrl?: string | null,
  userRole: string,
  aiEnabled: boolean
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      <Sidebar 
        logoUrl={logoUrl} 
        userRole={userRole} 
        aiEnabled={aiEnabled}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />
      
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[72px]' : 'ml-64'}`}>
        {children}
      </div>
    </>
  )
}
