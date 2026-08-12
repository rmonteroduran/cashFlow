"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient, updateClient } from "@/app/(dashboard)/proyecciones/actions"

export default function ClientForm({ client }: { client?: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: client?.name || "",
    cuit: client?.cuit || "",
    taxRateIIBB: client?.taxRateIIBB?.toString() || "0",
    taxRateGanancias: client?.taxRateGanancias?.toString() || "0",
    taxRateIVA: client?.taxRateIVA?.toString() || "0",
    taxRateSUSS: client?.taxRateSUSS?.toString() || "0",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      const data = {
        name: formData.name,
        cuit: formData.cuit.trim(),
        taxRateIIBB: parseFloat(formData.taxRateIIBB),
        taxRateGanancias: parseFloat(formData.taxRateGanancias),
        taxRateIVA: parseFloat(formData.taxRateIVA),
        taxRateSUSS: parseFloat(formData.taxRateSUSS),
      };

      if (client) {
        await updateClient(client.id, data);
      } else {
        await createClient(data);
      }
      router.push("/clientes")
    } catch (error: any) {
      console.error(error)
      setErrorMsg(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente / Razón Social</label>
          <input
            type="text"
            required
            placeholder="Ej: Consultora Tech S.A."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
          <input
            type="text"
            required
            pattern="\d*"
            title="Debe ingresar solo números"
            placeholder="Ej: 30123456789"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.cuit}
            onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Configuración de Retenciones Impositivas (%)</h3>
        <p className="text-xs text-blue-700 mb-4">
          Ingresa el porcentaje que típicamente retiene este cliente al momento de pagar. 
          Estos valores se usarán para calcular el ingreso neto real en el flujo de caja.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-blue-900 mb-1">IIBB (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="w-full px-3 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.taxRateIIBB}
              onChange={(e) => setFormData({ ...formData, taxRateIIBB: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-blue-900 mb-1">Ganancias (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="w-full px-3 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.taxRateGanancias}
              onChange={(e) => setFormData({ ...formData, taxRateGanancias: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-blue-900 mb-1">IVA (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="w-full px-3 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.taxRateIVA}
              onChange={(e) => setFormData({ ...formData, taxRateIVA: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-blue-900 mb-1">SUSS (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="w-full px-3 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.taxRateSUSS}
              onChange={(e) => setFormData({ ...formData, taxRateSUSS: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : (client ? "Guardar Cambios" : "Guardar Cliente")}
        </button>
      </div>
    </form>
  )
}
