"use client"

import { useState } from "react"
import { Landmark, Briefcase, Plus, Trash2, Edit2 } from "lucide-react"
import { AccountForm } from "@/components/AccountForm"
import { InvestmentForm } from "@/components/InvestmentForm"
import { deleteAccount, deleteInvestment } from "./actions"

export function CuentasClient({ accounts, investments }: { accounts: any[], investments: any[] }) {
  const [activeTab, setActiveTab] = useState<"accounts" | "investments">("accounts")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, type: "account" | "investment") => {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return
    
    if (type === "account") {
      await deleteAccount(id)
    } else {
      await deleteInvestment(id)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cuentas e Inversiones</h1>
          <p className="text-gray-500 mt-1">Administra tus saldos iniciales e instrumentos financieros.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {activeTab === "accounts" ? "Nueva Cuenta" : "Nueva Inversión"}
        </button>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === "accounts" 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Landmark className="w-4 h-4" />
          Cuentas Bancarias
        </button>
        <button
          onClick={() => setActiveTab("investments")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === "investments" 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Inversiones
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === "accounts" && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="py-4 px-6 font-medium">Nombre de Cuenta</th>
                <th className="py-4 px-6 font-medium">Moneda</th>
                <th className="py-4 px-6 font-medium text-right">Saldo Inicial (Ajuste)</th>
                <th className="py-4 px-6 font-medium text-right">Saldo Calculado</th>
                <th className="py-4 px-6 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">No hay cuentas registradas.</td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  const txSum = acc.transactions?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0;
                  const calculatedBalance = acc.initialBalance + txSum;
                  return (
                    <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{acc.name}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${acc.currency === 'USD' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {acc.currency}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-gray-500">${acc.initialBalance.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right font-bold text-gray-900">${calculatedBalance.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(acc)} className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(acc.id, "account")} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}

        {activeTab === "investments" && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="py-4 px-6 font-medium">Inversión</th>
                <th className="py-4 px-6 font-medium">Entidad / Inst.</th>
                <th className="py-4 px-6 font-medium">Plazo</th>
                <th className="py-4 px-6 font-medium">Rendimiento</th>
                <th className="py-4 px-6 font-medium text-right">Monto</th>
                <th className="py-4 px-6 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {investments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No hay inversiones registradas.</td>
                </tr>
              ) : (
                investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{inv.name}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{inv.entity}</div>
                      <div className="text-xs text-gray-500">{inv.instrumentType}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{inv.termDays ? `${inv.termDays} días` : '-'}</td>
                    <td className="py-4 px-6 text-green-600 font-medium">{inv.returnRate ? `${inv.returnRate}%` : '-'}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-gray-900">${inv.amount.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-1">{inv.currency}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(inv)} className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inv.id, "investment")} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingItem 
                ? (activeTab === "accounts" ? "Editar Cuenta" : "Editar Inversión") 
                : (activeTab === "accounts" ? "Nueva Cuenta" : "Nueva Inversión")
              }
            </h2>
            
            {activeTab === "accounts" ? (
              <AccountForm account={editingItem} onSuccess={closeModal} onCancel={closeModal} />
            ) : (
              <InvestmentForm investment={editingItem} onSuccess={closeModal} onCancel={closeModal} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
