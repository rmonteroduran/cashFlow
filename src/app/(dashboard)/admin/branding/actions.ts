"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma";

export async function getBranding() {
  const branding = await prisma.companyBranding.findFirst()
  if (branding) return branding
  
  // If none exists, create default
  return await prisma.companyBranding.create({
    data: {
      primaryColor: "#1e3a8a",
      secondaryColor: "#3b82f6",
      accentColor: "#f59e0b",
    }
  })
}

export async function updateBranding(data: {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  aiEnabled?: boolean;
  azureOpenAiEndpoint?: string | null;
  azureOpenAiApiKey?: string | null;
  azureOpenAiDeploymentName?: string | null;
}) {
  const branding = await prisma.companyBranding.findFirst()
  
  if (branding) {
    await prisma.companyBranding.update({
      where: { id: branding.id },
      data
    })
  } else {
    await prisma.companyBranding.create({
      data
    })
  }

  // Revalidate layout to fetch new CSS variables
  revalidatePath("/", "layout")
}
