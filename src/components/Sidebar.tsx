"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Paintbrush, 
  LogOut,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Users,
  LineChart,
  ArrowRightLeft,
  Landmark
} from "lucide-react"

export default function Sidebar({ 
  logoUrl, 
  userRole = "ANALYST", 
  aiEnabled = false,
  isCollapsed = false,
  onToggle
}: { 
  logoUrl?: string | null, 
  userRole?: string, 
  aiEnabled?: boolean,
  isCollapsed?: boolean,
  onToggle?: () => void
}) {
  const pathname = usePathname()

  const baseNavItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Cuentas e Inversiones", href: "/cuentas", icon: Landmark },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Proyecciones", href: "/proyecciones", icon: LineChart },
    { name: "Conciliación", href: "/conciliacion", icon: ArrowRightLeft }
  ]

  let navItems: any[] = []
  
  if (userRole === "ADMIN") {
    navItems = [
      { name: "Configuración Visual", href: "/admin/branding", icon: Paintbrush },
      { name: "Seguridad", href: "/admin/security", icon: Shield }
    ]
  } else if (userRole === "ADMIN_MANAGER") {
    navItems = [
      ...baseNavItems,
      { name: "Configuración Visual", href: "/admin/branding", icon: Paintbrush },
      { name: "Seguridad", href: "/admin/security", icon: Shield }
    ]
  } else {
    navItems = [...baseNavItems]
  }

  return (
    <aside className={`bg-white border-r border-gray-200 h-screen flex flex-col fixed top-0 left-0 z-40 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-64'}`}>
      
      {/* Brand Header */}
      <div className={`h-16 flex items-center px-6 border-b border-gray-200 ${isCollapsed ? 'justify-center !px-0' : ''}`}>
        <div className="flex items-center gap-2">
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logoUrl} alt="Logo" className={`h-8 object-contain ${isCollapsed ? 'max-w-[40px]' : 'max-w-[120px]'}`} />
          ) : (
            <div className="w-8 h-8 shrink-0 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-bold flex items-center justify-center">
              C
            </div>
          )}
          {!isCollapsed && (
            <span className="font-bold text-gray-900 text-lg tracking-tight whitespace-nowrap overflow-hidden">
              cash<span className="text-[var(--color-primary)]">Flow</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item: any) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/")
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-md" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[var(--color-primary-foreground)]" : "text-gray-400"}`} />
              {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer (Toggle & Logout) */}
      <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
        <button 
          onClick={onToggle}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5 shrink-0" /> : <ChevronLeft className="w-5 h-5 shrink-0" />}
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Colapsar menú</span>}
        </button>

        <Link 
          href="/login"
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 text-gray-400 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Cerrar Sesión</span>}
        </Link>
      </div>

    </aside>
  )
}
