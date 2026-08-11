"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/(dashboard)/proyecciones/actions"

export default function ClientForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    taxRateIIBB: "0",
    taxRateGanancias: "0",
    taxRateIVA: "0",
    taxRateSUSS: "0",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createClient({
        name: formData.name,
        taxRateIIBB: parseFloat(formData.taxRateIIBB),
        taxRateGanancias: parseFloat(formData.taxRateGanancias),
        taxRateIVA: parseFloat(formData.taxRateIVA),
        taxRateSUSS: parseFloat(formData.taxRateSUSS),
      })
      router.push("/clientes")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          {isSubmitting ? "Guardando..." : "Guardar Cliente"}
        </button>
      </div>
    </form>
  )
}
