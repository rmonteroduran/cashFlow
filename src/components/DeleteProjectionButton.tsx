"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteProjection } from "@/app/(dashboard)/proyecciones/actions"

export function DeleteProjectionButton({ projectionId, disabled }: { projectionId: string, disabled?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar esta proyección?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteProjection(projectionId)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting || disabled}
      title={disabled ? "No se puede eliminar una proyección conciliada" : "Eliminar Proyección"}
      className="inline-flex p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-300 disabled:cursor-not-allowed"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
