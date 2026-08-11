import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const reason = resolvedSearchParams.reason

  let title = "Acceso Denegado"
  let message = "No tienes permiso para acceder a esta aplicación."

  if (reason === "domain") {
    title = "Dominio no autorizado"
    message = "El dominio de tu correo electrónico no se encuentra en la lista de dominios permitidos para acceder a esta plataforma. Contacta al administrador si crees que esto es un error."
  } else if (reason === "role") {
    title = "Usuario no registrado"
    message = "Tu dominio es válido, pero tu cuenta de correo no tiene un rol asignado en el sistema o se encuentra inactiva. Por favor contacta al administrador de la plataforma para que te otorgue acceso."
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        <Link 
          href="/login" 
          className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors w-full"
        >
          Volver al Inicio de Sesión
        </Link>
      </div>
    </div>
  )
}
