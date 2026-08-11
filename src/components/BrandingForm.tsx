"use client"

import { useState } from "react"
import { updateBranding } from "@/app/(dashboard)/admin/branding/actions"

interface BrandingData {
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  aiEnabled: boolean
  azureOpenAiEndpoint: string | null
  azureOpenAiApiKey: string | null
  azureOpenAiDeploymentName: string | null
}

// Función de utilidad temporal para el cliente
function getContrastYIQ(hexcolor: string) {
  let hex = hexcolor.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  if (hex.length !== 6) return "#ffffff";
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? "#0f172a" : "#ffffff";
}

export default function BrandingForm({ initialData }: { initialData: BrandingData }) {
  const [formData, setFormData] = useState({
    logoUrl: initialData.logoUrl || "",
    primaryColor: initialData.primaryColor,
    secondaryColor: initialData.secondaryColor,
    accentColor: initialData.accentColor,
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
    // Reset success message when editing again
    setSaveSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      await updateBranding(formData)
      setSaveSuccess(true)
      
      // Update CSS variables immediately in the document root for real-time reflection
      // without needing a hard reload (though revalidatePath will handle the next load)
      document.documentElement.style.setProperty('--color-primary', formData.primaryColor)
      document.documentElement.style.setProperty('--color-primary-foreground', getContrastYIQ(formData.primaryColor))
      document.documentElement.style.setProperty('--color-secondary', formData.secondaryColor)
      document.documentElement.style.setProperty('--color-secondary-foreground', getContrastYIQ(formData.secondaryColor))
      document.documentElement.style.setProperty('--color-accent', formData.accentColor)
      document.documentElement.style.setProperty('--color-accent-foreground', getContrastYIQ(formData.accentColor))
      
    } catch (error) {
      console.error("Failed to update branding:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Box: Branding and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Visual Preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 text-[var(--color-foreground)]">Preferencias Visuales</h2>
          
          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL del Logotipo</label>
              <input 
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Proporciona un enlace directo a tu logotipo (idealmente PNG transparente o SVG).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Primario</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-sm text-gray-600 font-mono">{formData.primaryColor}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Secundario</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-sm text-gray-600 font-mono">{formData.secondaryColor}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Acento</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color"
                    name="accentColor"
                    value={formData.accentColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-sm text-gray-600 font-mono">{formData.accentColor}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-sm text-green-600 font-medium">¡Guardado con éxito!</span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-primary-foreground)] font-medium rounded-lg transition-all disabled:opacity-50 shadow-sm text-sm"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Previsualización en Tiempo Real</h2>
          
          <div 
            className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-lg flex-1"
            style={{
              '--preview-primary': formData.primaryColor,
              '--preview-primary-foreground': getContrastYIQ(formData.primaryColor),
              '--preview-secondary': formData.secondaryColor,
              '--preview-secondary-foreground': getContrastYIQ(formData.secondaryColor),
              '--preview-accent': formData.accentColor,
              '--preview-accent-foreground': getContrastYIQ(formData.accentColor),
            } as React.CSSProperties}
          >
            {/* Mock Header */}
            <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                {formData.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.logoUrl} alt="Logo Preview" className="h-8 max-w-[120px] object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[var(--preview-primary)] flex items-center justify-center text-[var(--color-primary-foreground)] font-bold">
                    W
                  </div>
                )}
                <span className="font-semibold text-gray-800">Cashflow App</span>
              </div>
              
              <div className="flex gap-4">
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
              </div>
            </div>

            {/* Mock Body */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Candidatos Activos</h3>
                <button type="button" className="px-4 py-1.5 bg-[var(--preview-primary)] text-[var(--color-primary-foreground)] text-sm font-medium rounded-md shadow-md">
                  + Nuevo
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-gray-100 flex items-center justify-between hover:border-[var(--preview-secondary)] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[var(--preview-primary)] font-bold">
                      JS
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">John Smith</p>
                      <p className="text-xs text-gray-500">Frontend Developer</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium bg-[var(--preview-accent)] bg-opacity-20 text-[var(--preview-accent)] rounded-full">
                    Entrevista
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-6 text-center">
            Así es como se verán los elementos principales de la interfaz.
          </p>
        </div>
      </div>
    </form>
  )
}
