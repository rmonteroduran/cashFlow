"use client"

import { useState } from "react"
import { createAccount, updateAccount } from "@/app/(dashboard)/cuentas/actions"
import { Currency } from "@prisma/client"

export function AccountForm({ 
  account, 
  onSuccess, 
  onCancel 
}: { 
  account?: any, 
  onSuccess: () => void, 
  onCancel: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: account?.name || "",
    currency: account?.currency || "ARS",
    initialBalance: account?.initialBalance?.toString() || "0",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (account) {
        await updateAccount(account.id, {
          name: formData.name,
          initialBalance: parseFloat(formData.initialBalance)
        })
      } else {
        await createAccount({
          name: formData.name,
          currency: formData.currency as Currency,
          initialBalance: parseFloat(formData.initialBalance)
        })
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Cuenta</label>
        <input
          type="text"
          required
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {!account && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial / Ajuste</label>
        <input
          type="number"
          required
          step="0.01"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
          value={formData.initialBalance}
          onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Este valor se sumará a los movimientos conciliados.
        </p>
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
          {isSubmitting ? "Guardando..." : (account ? "Actualizar" : "Crear")}
        </button>
      </div>
    </form>
  )
}
