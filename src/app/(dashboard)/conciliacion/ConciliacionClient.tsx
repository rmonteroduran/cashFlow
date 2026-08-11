"use client"

import { useState } from "react"
import { processBankStatement, reconcile } from "./actions"

export default function ConciliacionClient({ 
  transactions, 
  projections, 
  bankAccounts 
}: { 
  transactions: any[], 
  projections: any[], 
  bankAccounts: any[] 
}) {
  const [file, setFile] = useState<File | null>(null)
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || "")
  const [isUploading, setIsUploading] = useState(false)
  const [selectedTx, setSelectedTx] = useState<string | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !bankAccountId) return

    setIsUploading(true)
    try {
      const text = await file.text()
      await processBankStatement(text, bankAccountId)
      setFile(null)
    } catch (error) {
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleReconcile = async (projId: string) => {
    if (!selectedTx) return
    try {
      await reconcile(selectedTx, projId)
      setSelectedTx(null)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Importar Extracto Bancario</h2>
        <form onSubmit={handleUpload} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Bancaria</label>
            <select 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none"
              value={bankAccountId}
              onChange={e => setBankAccountId(e.target.value)}
              required
            >
              {bankAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo CSV</label>
            <input 
              type="file" 
              accept=".csv"
              required
              className="w-full px-4 py-1.5 border border-gray-200 rounded-lg"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <button 
            type="submit" 
            disabled={!file || isUploading}
            className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isUploading ? "Procesando..." : "Importar"}
          </button>
        </form>
      </div>

      {/* Matcher Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800">1. Seleccionar Movimiento Real</h3>
              <p className="text-xs text-gray-500">Transacciones bancarias sin conciliar.</p>
            </div>
            {transactions.length > 0 && (
              <button 
                onClick={async () => {
                  if (confirm("¿Estás seguro de vaciar todos los movimientos no conciliados?")) {
                    const { clearUnreconciledTransactions } = await import("./actions");
                    await clearUnreconciledTransactions();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
              >
                Vaciar Lista
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No hay movimientos pendientes.</p>
            ) : (
              transactions.map(tx => (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTx(tx.id === selectedTx ? null : tx.id)}
                  className={`p-4 cursor-pointer transition-colors ${selectedTx === tx.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{tx.description}</p>
                    </div>
                    <span className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Projections */}
        <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${selectedTx ? 'border-blue-300 shadow-blue-100/50' : 'border-gray-200'}`}>
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">2. Enlazar con Proyección</h3>
            <p className="text-xs text-gray-500">Selecciona el flujo proyectado correspondiente.</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto relative">
            {!selectedTx && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <p className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  Selecciona un movimiento real primero
                </p>
              </div>
            )}
            
            {projections.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No hay proyecciones pendientes.</p>
            ) : (
              projections.map(proj => (
                <div key={proj.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500">{new Date(proj.date).toLocaleDateString()}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{proj.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${proj.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      ${proj.netAmount.toLocaleString()}
                    </span>
                    <button 
                      onClick={() => handleReconcile(proj.id)}
                      className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Enlazar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
