import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  let branding = null;
  try {
    const { prisma } = await import("@/lib/prisma");
    branding = await prisma.companyBranding.findFirst();
  } catch (e) {
    console.error("Error fetching branding for metadata:", e);
  }

  return {
    title: "cashFlow",
    description: "Sistema de Gestión de Reclutamiento",
    icons: branding?.logoUrl ? {
      icon: branding.logoUrl,
      shortcut: branding.logoUrl,
      apple: branding.logoUrl,
    } : undefined
  };
}

// Utilidad para calcular luminosidad y contraste
function getContrastYIQ(hexcolor: string) {
  // Eliminar el hash si existe
  hexcolor = hexcolor.replace("#", "");
  
  if (hexcolor.length === 3) {
    hexcolor = hexcolor.split("").map(c => c + c).join("");
  }
  
  if (hexcolor.length !== 6) return "#ffffff"; // Default a blanco si no es válido
  
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  
  // Fórmula YIQ para luminosidad
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Si es muy claro, devuelve un texto oscuro, de lo contrario texto blanco
  return (yiq >= 128) ? "#0f172a" : "#ffffff";
}

import { prisma } from "@/lib/prisma";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let branding = null;
  try {
    branding = await prisma.companyBranding.findFirst();
  } catch (e) {
    console.error("Error fetching branding:", e);
  }

  const primaryColor = branding?.primaryColor || "#1e3a8a";
  const secondaryColor = branding?.secondaryColor || "#3b82f6";
  const accentColor = branding?.accentColor || "#f59e0b";
  
  // Calcular foreground (texto sobre fondos)
  const primaryForeground = getContrastYIQ(primaryColor);
  const secondaryForeground = getContrastYIQ(secondaryColor);
  const accentForeground = getContrastYIQ(accentColor);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{
        "--color-primary": primaryColor,
        "--color-primary-foreground": primaryForeground,
        "--color-secondary": secondaryColor,
        "--color-secondary-foreground": secondaryForeground,
        "--color-accent": accentColor,
        "--color-accent-foreground": accentForeground,
      } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
