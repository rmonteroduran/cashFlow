"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginButtons() {
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("password")

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault()
    signIn("credentials", { email, password, callbackUrl: "/" })
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 21 21">
          <path fill="#f25022" d="M1 1h9v9H1z" />
          <path fill="#00a4ef" d="M11 1h9v9h-9z" />
          <path fill="#7fba00" d="M1 11h9v9H1z" />
          <path fill="#ffb900" d="M11 11h9v9h-9z" />
        </svg>
        <span className="font-medium text-gray-700">Iniciar sesión con Microsoft</span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">O modo desarrollo</span>
        </div>
      </div>

      <form onSubmit={handleCredentialsLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" 
          />
        </div>
        <button 
          type="submit"
          className="w-full flex justify-center py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium shadow-sm"
        >
          Entrar con usuario local
        </button>
      </form>
    </div>
  )
}
