"use client"

import { useState, useMemo } from "react"
import { Role } from "@prisma/client"
import { createUser, updateUser, deleteUser } from "@/app/(dashboard)/admin/actions"
import { Plus, Edit, Trash2, Shield, User, Briefcase, Eye, X, AlertCircle } from "lucide-react"
import ConfirmModal from "@/components/ConfirmModal"

type UserAccess = {
  id: string
  email: string
  role: Role
  isActive: boolean
  createdAt: Date
}

export default function UsersManager({ initialUsers }: { initialUsers: UserAccess[] }) {
  const [users, setUsers] = useState<UserAccess[]>(initialUsers)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const showError = (msg: string) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(null), 5000)
  }
  
  const [formData, setFormData] = useState({
    email: "",
    role: "ANALYST" as Role,
    isActive: true
  })

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    return users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [users, searchTerm])

  const resetForm = () => {
    setFormData({ email: "", role: "ANALYST", isActive: true })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (user: UserAccess) => {
    setFormData({ email: user.email, role: user.role, isActive: user.isActive })
    setEditingId(user.id)
    setIsAdding(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    const res = await deleteUser(userToDelete)
    if (res.success) {
      setUsers(users.filter(u => u.id !== userToDelete))
      setDeleteModalOpen(false)
      setUserToDelete(null)
    } else {
      showError(res.error || "Error al eliminar usuario")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      const res = await updateUser(editingId, { role: formData.role, isActive: formData.isActive })
      if (res.success) {
        setUsers(users.map(u => u.id === editingId ? { ...u, role: formData.role, isActive: formData.isActive } : u))
        resetForm()
      } else {
        showError(res.error || "Error al actualizar usuario")
      }
    } else {
      const res = await createUser(formData)
      if (res.success) {
        window.location.reload()
      } else {
        showError(res.error || "Error al crear usuario")
      }
    }
  }

  return (
    <div className="space-y-6">
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  required
                  disabled={!!editingId}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:bg-gray-100 disabled:text-gray-500 transition-shadow"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Rol *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white transition-shadow"
                >
                  <option value="ADMIN_MANAGER">Admin Manager (Full Access)</option>
                  <option value="ADMIN">Admin (Technical)</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ANALYST">Analyst</option>
                </select>
              </div>
              
              <div className="pt-2 pb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Cuenta Activa</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  Si se desactiva, el usuario no podrá iniciar sesión.
                </p>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Usuarios Habilitados</h2>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Buscar por email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            {!isAdding && (
              <button 
                onClick={() => setIsAdding(true)}
                className="px-4 py-1.5 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Usuario</th>
                <th className="px-6 py-3 font-medium">Rol</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Fecha Creación</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                    {searchTerm ? "No se encontraron usuarios que coincidan con la búsqueda." : "No hay usuarios registrados."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {user.role === 'ADMIN_MANAGER' && <Shield className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />}
                        {user.role === 'ADMIN' && <Shield className="w-4 h-4 text-purple-500" />}
                        {user.role === 'MANAGER' && <Briefcase className="w-4 h-4 text-blue-500" />}
                        {user.role === 'ANALYST' && <User className="w-4 h-4 text-green-500" />}
                        <span>{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-1.5 rounded-md hover:bg-gray-200 transition-colors text-gray-500 hover:text-[var(--color-primary)]"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setUserToDelete(user.id)
                          setDeleteModalOpen(true)
                        }}
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setUserToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message="¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
      />

      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-red-50 text-red-800 px-4 py-3 rounded-xl shadow-lg border border-red-200 flex items-start gap-3 max-w-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-0.5 text-red-900">No se pudo realizar la acción</h4>
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
            <button 
              onClick={() => setErrorMsg(null)} 
              className="text-red-400 hover:text-red-600 transition-colors shrink-0"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
