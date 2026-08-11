# Software Design Document — RecruIT

**Versión:** 1.0  
**Fecha:** Julio 2026  
**Autor:** Rodrigo Montero Duran  
**Destinatario:** Equipo de Infraestructura / IT  

---

## 1. Descripción General

**RecruIT** es una aplicación web de gestión del talento, vacantes y clientes (ATS - Applicant Tracking System). Centraliza el proceso de selección mediante la administración de candidatos, clientes, vacantes y la extracción automatizada de información de CVs utilizando Inteligencia Artificial (Azure OpenAI).

**Usuarios objetivo**
Personal de reclutamiento, managers y administradores con cuentas validadas en Azure AD, con acceso controlado por dominios autorizados (whitelist) y roles explícitos en base de datos.

**Funciones principales**

| Módulo | Descripción |
|---|---|
| **Candidatos** | ABM de candidatos, parseo de CV con IA, gestión de etapas y perfiles |
| **Pipeline** | Kanban interactivo para seguimiento del estado de los postulantes |
| **Vacantes** | Búsquedas activas, estados, prioridades, rangos salariales y asignación a clientes |
| **Clientes** | Gestión de empresas cliente, asociación en cascada con vacantes |
| **Seguridad** | Configuración de dominios permitidos (whitelist), gestión de usuarios y roles |
| **Ajustes** | Configuración de API Keys de IA y personalización de *branding* corporativo |

---

## 2. Stack Tecnológico

| Componente | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| Runtime | Node.js | ≥ 20 LTS |
| Lenguaje | TypeScript | 5.x |
| ORM | Prisma | 6.x |
| Base de datos | PostgreSQL | 15+ |
| Autenticación | NextAuth.js + Azure AD (Entra ID) | v4.x |
| Estilos | Tailwind CSS | 4.x |
| Package manager | pnpm | 9.x |
| IA & Parseo | OpenAI SDK / pdf-parse | 6.x / 1.1.x |

**Dependencias de producción relevantes**
```text
next, react, react-dom
@prisma/client, prisma
next-auth
openai, pdf-parse
@dnd-kit/core, @dnd-kit/sortable
lucide-react, recharts
```

---

## 3. Arquitectura de la Aplicación

**Modelo de ejecución**
La aplicación es un **monolito Next.js con App Router**. No tiene servicios separados ni microservicios.

```text
Browser
 └── Next.js App (SSR + Client Components)
     ├── Server Components → leen DB directamente vía Prisma
     ├── Server Actions → mutaciones directas a DB sin API REST
     ├── API Routes (/api/*) → NextAuth y endpoint de parseo de CV
     └── Client Components → UI reactiva (Kanban, modales), llama a Server Actions
```

**Estructura de directorios relevante**
```text
src/
├── app/
│   ├── (dashboard)/       # Rutas de negocio protegidas
│   ├── api/
│   │   ├── auth/[...nextauth]/ # Handler de NextAuth
│   │   └── extract-cv/         # Endpoint POST para Azure OpenAI
│   ├── login/             # Pantalla de inicio de sesión
│   └── unauthorized/      # Pantalla de acceso denegado
├── components/            # Componentes React reutilizables
├── lib/
│   ├── prisma.ts          # Singleton de Prisma Client
│   └── auth.ts            # Utilidades de sesión
└── prisma/
    └── schema.prisma      # Modelo de datos completo
```

**Modo de renderizado**
La aplicación utiliza renderizado dinámico en sus rutas de negocio para garantizar datos frescos en cada request y evitar problemas de caché con Next.js.

---

## 4. Base de Datos

**Motor**
**PostgreSQL 15+**. Compatible con cualquier proveedor o hosting nativo.

**Modelo de datos — entidades principales**

| Tabla | Descripción |
|---|---|
| `UserAccess` | Whitelist de usuarios autorizados + rol (ADMIN, MANAGER, RECRUITER) |
| `AllowedDomain` | Whitelist de dominios corporativos permitidos para auto-registro |
| `Client` | Empresas / Clientes de RMR |
| `JobOpening` | Vacantes o contratos asociados a un cliente |
| `Candidate` | Base de talento (con posición, seniority, salario pretendido) |
| `Activity` | Historial de interacciones de los candidatos |
| `AIConfig` | Credenciales encriptadas de Azure OpenAI para análisis de CVs |
| `CompanyBranding`| Configuración visual global (logo, colores primarios) persistida en DB |

**Conexión**
La aplicación usa conexión directa a PostgreSQL vía Prisma. La variable de entorno `DATABASE_URL` apunta al endpoint primario.

Formato de la URL:
```text
postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public
```
*Nota: Si se migra a PostgreSQL propio (RDS, Azure Database, instancia propia), basta con cambiar `DATABASE_URL` a la nueva cadena de conexión y ejecutar `npx prisma db push`. El schema está completamente declarado en `prisma/schema.prisma`.*

**Migrations**
El proyecto usa `prisma db push` (schema-driven, sin archivos de migración formales). Para producción, ejecutar:
```text
npx prisma db push
```

---

## 5. Autenticación y Control de Acceso

**Proveedor**
**Microsoft Azure AD (Entra ID)** — OAuth 2.0 / OIDC. 

**Flujo de autenticación**
```text
Usuario → /login
  → Redirect a Microsoft login (OAuth)
  → Callback: NextAuth evalúa si la BD de usuarios está vacía
  → Si DB Vacía → Primer ingreso: Crea usuario como ADMIN y autoriza dominio (Bootstraping)
  → Si no está vacía → NextAuth verifica dominio en tabla AllowedDomain
  → NextAuth consulta tabla UserAccess en DB
  → Si el email está en la whitelist → sesión JWT creada
  → Si no → redirect a /unauthorized
```

**Control de acceso en dos capas**
1. **Dominio:** Solo cuentas cuyos dominios estén explícitamente habilitados en `AllowedDomain` pueden continuar el flujo OAuth.
2. **Whitelist:** Solo emails registrados en la tabla `UserAccess` obtienen sesión. Un admin puede agregar/quitar usuarios desde `/admin/security`.

**Permisos**
El campo `role` (Enum) en `UserAccess` controla acceso granular. El rol `ADMIN` habilita la sección de seguridad.

**Requisito Azure AD**
Se necesita un **App Registration** en el tenant de Azure AD con:
- Redirect URI: `https://[DOMINIO_PRODUCCION]/api/auth/callback/azure-ad`
- Tipo de cuenta: "Accounts in this organizational directory only" (o multitenant según requerimiento).
- Permisos OAuth: `openid`, `profile`, `email`.
- *Admin Consent* otorgado para `User.Read`.

---

## 6. Variables de Entorno

Todas las variables de entorno deben configurarse en el entorno de despliegue (Vercel, servidor, contenedor, etc.).
**Ningún secreto va en el repositorio.**

| Variable | Descripción | Obligatoria |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | ✅ |
| `NEXTAUTH_SECRET` | Secret para firmar JWTs de sesión. Mínimo 32 chars aleatorios. | ✅ |
| `NEXTAUTH_URL` | URL pública completa de la app. | ✅ |
| `AZURE_AD_CLIENT_ID` | Client ID del App Registration en Azure AD | ✅ |
| `AZURE_AD_CLIENT_SECRET` | Client Secret del App Registration en Azure AD | ✅ |
| `AZURE_AD_TENANT_ID` | Tenant ID del directorio Azure AD | ✅ |

**Generación de NEXTAUTH_SECRET**
```text
openssl rand -base64 32
```

---

## 7. Opciones de Despliegue

**Opción A — Vercel (recomendada, menor fricción operativa)**
Vercel es la plataforma de despliegue nativa. Permite Serverless Functions automáticas para Server Actions y despliegue continuo vía GitHub.

**Opción B — Contenedor Docker en servidor propio / VPS**
El proyecto Next.js se puede empaquetar como imagen Docker estándar usando `output: 'standalone'` en la configuración de Next.

**Opción C — Azure App Service**
Dado que la aplicación se integra con Azure AD y Azure OpenAI, puede tener sentido desplegar en **Azure App Service (Node.js runtime)** o en **Azure Container Apps**.

---

## 8. Base de Datos — Opciones de Hosting

**Opción A — Supabase / Neon**
Bases de datos serverless PostgreSQL.

**Opción B — Azure Database for PostgreSQL (Flexible Server)**
Compatible 100% con Prisma. Requiere habilitar SSL en la cadena de conexión.

**Opción C — RDS PostgreSQL (AWS) / Cloud SQL (GCP)**
Idéntico en comportamiento. Cambiar solo `DATABASE_URL`.

---

## 9. Repositorio de Código

**Para transferir a un entorno de producción:**
1. Crear repositorio en GitHub corporativo.
2. Hacer push del código fuente (ramas `main` o `master`).
3. Actualizar el remote en plataforma CI/CD si corresponde.

---

## 10. Build y Deploy — Ciclo de Vida

**Build de producción**
```text
pnpm install
npx prisma generate
pnpm build 
```
*Nota: El script `prisma generate` debe ejecutarse antes del build de Next.js para generar el Prisma Client tipado.*

**Primer despliegue en nuevo entorno**
```text
# 1. Instalar dependencias
pnpm install

# 2. Empujar el schema a la DB (crea/actualiza tablas)
npx prisma db push

# 3. Autoinicialización
# El primer inicio de sesión completado vía web se designará como ADMIN global automáticamente.
```

---

## 11. Requisitos de Infraestructura — Resumen

| Recurso | Mínimo recomendado | Notas |
|---|---|---|
| **Compute** | 512 MB RAM, 0.5 vCPU | Next.js standalone; Vercel Serverless o cualquier Node 20 |
| **Base de datos** | PostgreSQL 15+, SSL habilitado | Crecimiento dependiente del volumen de registros |
| **Almacenamiento** | Disco para subidas temporales | Los CVs se guardan en el file system `/public/uploads` por el momento |
| **TLS** | Obligatorio | NextAuth requiere HTTPS en producción |
| **Dominio** | recruit.empresa.com o similar | Debe coincidir con `NEXTAUTH_URL` y el Redirect URI en Azure AD |
| **Azure AD** | App Registration activa | Ver sección 5 |
| **Node.js** | 20 LTS | Requerido por Next.js 16 |
| **pnpm** | 9.x | Package manager del proyecto |

---

## 12. Checklist de Migración

```text
AZURE AD
[ ] Crear (o reutilizar) App Registration en tenant corporativo
[ ] Configurar Redirect URI: https://[DOMINIO]/api/auth/callback/azure-ad
[ ] Otorgar Admin Consent al permiso User.Read
[ ] Obtener Client ID, Client Secret y Tenant ID

BASE DE DATOS
[ ] Crear instancia PostgreSQL 15+ en infraestructura
[ ] Ejecutar npx prisma db push si la DB está vacía
[ ] Verificar conectividad desde el servidor de app

DESPLIEGUE
[ ] Configurar las 6 variables de entorno
[ ] Configurar dominio y TLS
[ ] Primer deploy y smoke test:
    [ ] Login con la cuenta elegida para el ADMIN fundador
    [ ] Navegar a Seguridad -> Configurar API de Azure OpenAI
    [ ] Validar que la extracción de CV funcione correctamente
```

---

## 13. Consideraciones de Seguridad

- **Sin datos sensibles en repositorio:** El `.gitignore` excluye `.env` y `.env.local`. Las credenciales viven solo en el panel de variables de entorno del hosting.
- **Autenticación obligatoria:** Todos los layouts y acciones validan la sesión activa. No hay rutas públicas de negocio.
- **Bootstrapping controlado:** Si bien el primer usuario asume rol ADMIN de forma silenciosa, esto solo ocurre si la tabla `UserAccess` está 100% vacía. Posterior a ello, funciona una whitelist rígida.
- **Whitelist de usuarios:** El acceso está restringido a emails explícitamente cargados en la tabla `UserAccess`.
- **NEXTAUTH_SECRET:** Rotar si se sospecha compromiso. Al rotar, todas las sesiones activas quedan invalidadas.
- **NEXTAUTH_URL:** Debe ser la URL exacta del dominio de producción. Un mismatch rompe el flujo OAuth.

---

## 14. Contacto Técnico

| Rol | Persona | Contacto |
|---|---|---|
| Desarrollo / Owner | RODRIGO MONTERO DURAN | rmontero@rmrconsultores.com |
| Infraestructura / IT | - | - |
| Azure AD / IT | - | - |
