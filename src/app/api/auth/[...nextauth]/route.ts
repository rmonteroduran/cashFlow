import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import AzureADProvider from "next-auth/providers/azure-ad"
import GoogleProvider from "next-auth/providers/google"

import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "mock_client_id",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "mock_client_secret",
      tenantId: process.env.AZURE_AD_TENANT_ID || "mock_tenant_id",
    }),
    CredentialsProvider({
      name: "Development Login",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return { id: "mock-id", email: credentials.email, name: "Mock User" };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      if (!user.email) return false;
      
      if (account?.provider === 'azure-ad') {
        const domain = user.email.split('@')[1]?.toLowerCase();
        
        // --- BOOTSTRAP LOGIC ---
        // Si es el primer usuario que ingresa a la aplicación (no hay usuarios registrados),
        // lo convertimos automáticamente en ADMIN y permitimos su dominio.
        const userCount = await prisma.userAccess.count();
        if (userCount === 0) {
          // 1. Whitelist the domain
          await prisma.allowedDomain.upsert({
            where: { domain },
            update: {},
            create: { domain, isActive: true }
          });
          
          // 2. Create the admin user
          await prisma.userAccess.create({
            data: {
              email: user.email,
              role: 'ADMIN',
              isActive: true
            }
          });
          
          return true; // Acceso permitido para el primer usuario
        }
        
        // 1. Verify Domain (para usuarios regulares)
        const allowedDomain = await prisma.allowedDomain.findUnique({
          where: { domain }
        });
        
        if (!allowedDomain || !allowedDomain.isActive) {
          return "/unauthorized?reason=domain";
        }
        
        // 2. Verify User (para usuarios regulares)
        const userAccess = await prisma.userAccess.findUnique({
          where: { email: user.email }
        });
        
        if (!userAccess || !userAccess.isActive) {
          return "/unauthorized?reason=role";
        }
      }
      
      // For Credentials (dev mock) or if they passed the checks
      return true;
    },
    async session({ session, token }: any) {
      if (session.user) {
        const userAccess = await prisma.userAccess.findUnique({
          where: { email: session.user.email as string }
        });
        
        // For development, keep the mock roles if they use credentials
        let defaultMockRole = "ANALYST";
        if (session.user.email === "super@example.com") defaultMockRole = "ADMIN_MANAGER";
        if (session.user.email === "admin@example.com") defaultMockRole = "ADMIN";
        if (session.user.email === "manager@example.com") defaultMockRole = "MANAGER";
        
        (session.user as any).role = userAccess?.role || defaultMockRole;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
