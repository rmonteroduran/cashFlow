import Link from "next/link"
import { Briefcase } from "lucide-react"
import LoginButtons from "@/components/LoginButtons"

import { prisma } from "@/lib/prisma";

export default async function LoginPage() {
  let branding = null;
  try {
    branding = await prisma.companyBranding.findFirst();
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Header / Brand */}
        <div className="px-8 pt-10 pb-6 text-center">
          {branding?.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={branding.logoUrl} alt="Logo" className="h-16 mx-auto mb-6 object-contain" />
          ) : (
            <div className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center text-[var(--color-primary-foreground)] mx-auto mb-6 shadow-lg shadow-[var(--color-primary)]/30">
              <Briefcase className="w-8 h-8" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Bienvenido a cash<span className="text-[var(--color-primary)]">flow</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">Inicia sesión para gestionar el flujo de caja</p>
        </div>

        {/* Login Actions */}
        <div className="px-8 pb-10 space-y-6">
          <LoginButtons />
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}
