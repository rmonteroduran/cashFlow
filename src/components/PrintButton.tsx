"use client"

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium shadow-sm hover:bg-gray-50 transition-colors"
    >
      Exportar Foto de Caja
    </button>
  )
}
