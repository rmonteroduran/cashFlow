"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"

export default function ObservationViewer({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false)

  // Truncate text for the table view
  const maxLength = 60
  const isLong = text.length > maxLength
  const truncatedText = isLong ? text.substring(0, maxLength) + "..." : text

  return (
    <>
      <div className="flex items-center justify-between gap-2 min-w-[200px]">
        <span className="truncate max-w-[250px] block" title={!isLong ? text : undefined}>{truncatedText}</span>
        {isLong && (
          <button 
            onClick={() => setIsOpen(true)}
            className="text-[var(--color-primary)] hover:opacity-80 transition-opacity flex-shrink-0 bg-[var(--color-primary)]/10 p-1.5 rounded-md"
            title="Ver detalle completo"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Detalle de la Observación</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {text}
              </p>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end flex-shrink-0 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 text-sm font-medium bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
