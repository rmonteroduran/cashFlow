"use client"

import { useState } from "react"
import { createInvestment, updateInvestment } from "@/app/(dashboard)/cuentas/actions"
import { Currency } from "@prisma/client"

export function InvestmentForm({ 
  investment, 
  onSuccess, 
  onCancel 
}: { 
  investment?: any, 
  onSuccess: () => void, 
  onCancel: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: investment?.name || "",
    entity: investment?.entity || "",
    instrumentType: investment?.instrumentType || "",
    termDays: investment?.termDays?.toString() || "",
    returnRate: investment?.returnRate?.toString() || "",
    amount: investment?.amount?.toString() || "",
    currency: investment?.currency || "ARS",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const data = {
        name: formData.name,
        entity: formData.entity,
        instrumentType: formData.instrumentType,
        termDays: formData.termDays ? parseInt(formData.termDays) : undefined,
        returnRate: formData.returnRate ? parseFloat(formData.returnRate) : undefined,
        amount: parseFloat(formData.amount),
        currency: formData.currency as Currency,
      }

      if (investment) {
        await updateInvestment(investment.id, data)
      } else {
        await createInvestment(data)
      }
      onSuccess()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Inversión</label>
        <input
          type="text"
          required
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entidad (Broker/Banco)</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.entity}
            onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instrumento</label>
          <input
            type="text"
            required
            placeholder="Ej: Plazo Fijo, FCI, CEDEAR"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.instrumentType}
            onChange={(e) => setFormData({ ...formData, instrumentType: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monto Invertido</label>
        <div className="flex gap-2">
          <select
            className="px-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            className="flex-1 min-w-0 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plazo (días)</label>
          <input
            type="number"
            min="0"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.termDays}
            onChange={(e) => setFormData({ ...formData, termDays: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rentabilidad Esperada (%)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.returnRate}
            onChange={(e) => setFormData({ ...formData, returnRate: e.target.value })}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : (investment ? "Actualizar" : "Crear")}
        </button>
      </div>
    </form>
  )
}
