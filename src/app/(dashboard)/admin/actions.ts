"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

export async function getUsers() {
  try {
    return await prisma.userAccess.findMany({
      orderBy: { createdAt: "desc" }
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function createUser(data: { email: string, role: Role, isActive: boolean }) {
  try {
    await prisma.userAccess.create({
      data: {
        email: data.email,
        role: data.role,
        isActive: data.isActive
      }
    })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error creating user:", error)
    return { error: "No se pudo crear el usuario. Asegúrate de que el correo no esté duplicado." }
  }
}

export async function updateUser(id: string, data: { role: Role, isActive: boolean }) {
  try {
    const userToUpdate = await prisma.userAccess.findUnique({ where: { id } })
    if (userToUpdate && (userToUpdate.role === Role.ADMIN || userToUpdate.role === Role.ADMIN_MANAGER) && userToUpdate.isActive) {
      const isDemoted = data.role !== Role.ADMIN && data.role !== Role.ADMIN_MANAGER;
      const isDeactivated = data.isActive === false;
      
      if (isDemoted || isDeactivated) {
        const activeAdminsCount = await prisma.userAccess.count({
          where: {
            id: { not: id },
            isActive: true,
            role: { in: [Role.ADMIN, Role.ADMIN_MANAGER] }
          }
        });
        
        if (activeAdminsCount === 0) {
          return { error: "No se puede quitar el rol o deshabilitar al último administrador activo del sistema." }
        }
      }
    }

    await prisma.userAccess.update({
      where: { id },
      data: {
        role: data.role,
        isActive: data.isActive
      }
    })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error updating user:", error)
    return { error: "No se pudo actualizar el usuario." }
  }
}

export async function deleteUser(id: string) {
  try {
    const userToDelete = await prisma.userAccess.findUnique({ where: { id } })
    if (userToDelete && (userToDelete.role === Role.ADMIN || userToDelete.role === Role.ADMIN_MANAGER) && userToDelete.isActive) {
      const activeAdminsCount = await prisma.userAccess.count({
        where: {
          id: { not: id },
          isActive: true,
          role: { in: [Role.ADMIN, Role.ADMIN_MANAGER] }
        }
      });
      
      if (activeAdminsCount === 0) {
        return { error: "No se puede eliminar al último administrador activo del sistema." }
      }
    }

    await prisma.userAccess.delete({
      where: { id }
    })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "No se pudo eliminar el usuario." }
  }
}
