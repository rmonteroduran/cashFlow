"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProjection } from "@/app/(dashboard)/proyecciones/actions"

export default function ProjectionForm({ clients }: { clients: any[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    currency: "ARS" as "ARS" | "USD",
    type: "INCOME" as "INCOME" | "EXPENSE",
    clientId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Fix timezone issue by parsing date at noon local time
      const [year, month, day] = formData.date.split("-").map(Number)
      const localDate = new Date(year, month - 1, day, 12, 0, 0)

      await createProjection({
        date: localDate,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        type: formData.type,
        clientId: formData.clientId || undefined,
      })
      router.push("/proyecciones")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as "INCOME" | "EXPENSE" })}
          >
            <option value="INCOME">Ingreso (Cobranza)</option>
            <option value="EXPENSE">Egreso (Pago)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Proyectada</label>
          <input
            type="date"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <input
          type="text"
          required
          placeholder="Ej: Factura 0001 - Consultoría"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto Bruto y Moneda</label>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as "ARS" | "USD" })}
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              placeholder="0.00"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente Asociado (Opcional)</label>
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            disabled={formData.type === "EXPENSE"}
          >
            <option value="">Seleccione un cliente...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          {formData.type === "INCOME" && (
            <p className="text-xs text-gray-500 mt-1">Si seleccionas un cliente, se descontarán automáticamente los impuestos (IIBB, Ganancias, etc.) configurados.</p>
          )}
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
          {isSubmitting ? "Guardando..." : "Guardar Proyección"}
        </button>
      </div>
    </form>
  )
}
