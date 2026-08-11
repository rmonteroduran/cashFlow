"use client"

import { CheckCircle, X } from "lucide-react"
import { useEffect } from "react"

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string | React.ReactNode
  buttonText?: string
}

export default function InfoModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "Aceptar",
}: InfoModalProps) {
  
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="text-sm text-gray-600 whitespace-pre-line">
            {message}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 bg-[var(--color-primary)]"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  )
}
