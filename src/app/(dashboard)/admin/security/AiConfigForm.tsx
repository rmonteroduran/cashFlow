"use client"

import { useState } from "react"
import { updateBranding } from "@/app/(dashboard)/admin/branding/actions"

interface AiData {
  aiEnabled: boolean
  azureOpenAiEndpoint: string | null
  azureOpenAiApiKey: string | null
  azureOpenAiDeploymentName: string | null
}

export default function AiConfigForm({ initialData }: { initialData: AiData }) {
  const [formData, setFormData] = useState({
    aiEnabled: initialData.aiEnabled || false,
    azureOpenAiEndpoint: initialData.azureOpenAiEndpoint || "",
    azureOpenAiApiKey: initialData.azureOpenAiApiKey || "",
    azureOpenAiDeploymentName: initialData.azureOpenAiDeploymentName || "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
    setSaveSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await updateBranding(formData)
      setSaveSuccess(true)
    } catch (error) {
      console.error("Failed to update AI config:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inteligencia Artificial</h2>
          <p className="text-sm text-gray-500 mt-1">Configura los parámetros para habilitar el uso de IA.</p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-foreground)] text-sm font-medium rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {isSaving ? "Guardando..." : "Guardar AI"}
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
          Configuración de IA guardada con éxito.
        </div>
      )}

      <div className="space-y-6">
        <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            name="aiEnabled"
            checked={formData.aiEnabled}
            onChange={handleChange}
            className="w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
          />
          <div>
            <span className="font-medium text-gray-900 block">Habilitar uso de IA</span>
            <span className="text-sm text-gray-500">Permite a la plataforma utilizar IA.</span>
          </div>
        </label>

        {formData.aiEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Azure OpenAI Endpoint</label>
              <input
                type="url"
                name="azureOpenAiEndpoint"
                value={formData.azureOpenAiEndpoint}
                onChange={handleChange}
                placeholder="https://my-resource.openai.azure.com/"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <input
                type="password"
                name="azureOpenAiApiKey"
                value={formData.azureOpenAiApiKey}
                onChange={handleChange}
                placeholder="••••••••••••••••••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deployment Name</label>
              <input
                type="text"
                name="azureOpenAiDeploymentName"
                value={formData.azureOpenAiDeploymentName}
                onChange={handleChange}
                placeholder="ej. gpt-4o"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all text-sm bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
