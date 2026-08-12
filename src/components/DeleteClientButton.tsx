"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteClient } from "@/app/(dashboard)/proyecciones/actions"

export function DeleteClientButton({ clientId, clientName }: { clientId: string, clientName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al cliente "${clientName}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteClient(clientId)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      title="Eliminar Cliente"
      className="inline-flex p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
