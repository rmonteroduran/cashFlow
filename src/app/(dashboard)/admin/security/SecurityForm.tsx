"use client"

import { useState } from "react"
import { Shield, Plus, Trash2, Power, PowerOff } from "lucide-react"
import { createAllowedDomain, toggleDomainStatus, deleteAllowedDomain } from "./actions"

export default function SecurityForm({ initialDomains }: { initialDomains: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    
    const formData = new FormData(e.currentTarget)
    try {
      const result = await createAllowedDomain(formData)
      if (result.error) {
        setErrorMsg(result.error)
      } else {
        (e.target as HTMLFormElement).reset()
      }
    } catch (error) {
      setErrorMsg("Ocurrió un error inesperado al añadir el dominio.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleDomainStatus(id, !currentStatus)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este dominio? Perderán el acceso inmediatamente los usuarios de este dominio.")) {
      await deleteAllowedDomain(id)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
        <Shield className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900">Autenticación por Dominio Restringido</h3>
          <p className="text-sm text-blue-800 mt-1">
            Los usuarios solo podrán iniciar sesión (usando Microsoft Entra ID) si su cuenta de correo 
            pertenece a uno de los dominios registrados a continuación. Adicionalmente, el usuario debe tener un 
            rol asignado en la plataforma.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Dominios Habilitados</h2>
          
          <form onSubmit={handleCreate} className="flex gap-2">
            <input 
              type="text" 
              name="domain"
              placeholder="ej. empresa.com" 
              required
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Añadir
            </button>
          </form>
        </div>
        
        {errorMsg && (
          <div className="px-6 py-3 bg-red-50 text-red-600 text-sm border-b border-red-100 font-medium">
            {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Dominio</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialDomains.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">
                    No hay dominios registrados. Ningún usuario nuevo podrá ingresar.
                  </td>
                </tr>
              ) : (
                initialDomains.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">@{d.domain}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {d.isActive ? 'Habilitado' : 'Deshabilitado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggle(d.id, d.isActive)}
                        className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ${d.isActive ? 'text-gray-500' : 'text-green-600'}`}
                        title={d.isActive ? 'Desactivar dominio' : 'Activar dominio'}
                      >
                        {d.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                        title="Eliminar dominio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
