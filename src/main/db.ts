import { PrismaClient } from '@prisma/client'
import { ipcMain } from 'electron'

// Instanciamos la DB
const prisma = new PrismaClient()

export const setupDBHandlers = () => {
  // 1. Obtener todos los ejercicios
  ipcMain.handle('db:get-exercises', async () => {
    try {
      return await prisma.exercise.findMany({
        include: { pattern: true }, // Traemos también el nombre del patrón
        orderBy: { name: 'asc' }
      })
    } catch (e) {
      console.error(e)
      return []
    }
  })

  // 2. Guardar un nuevo ejercicio
  ipcMain.handle('db:create-exercise', async (_, data) => {
    // data llega como { name, videoUrl, patternName }
    try {
      // Primero buscamos o creamos el patrón (ej: "Tracción")
      let pattern = await prisma.pattern.findUnique({
        where: { name: data.patternName }
      })

      if (!pattern) {
        pattern = await prisma.pattern.create({
          data: { name: data.patternName }
        })
      }

      // Ahora creamos el ejercicio vinculado
      const exercise = await prisma.exercise.create({
        data: {
          name: data.name,
          videoUrl: data.videoUrl,
          patternId: pattern.id
        }
      })
      
      return { success: true, exercise }
    } catch (e) {
      console.error(e)
      return { success: false, error: String(e) }
    }
  })

  // 3. Obtener solo los patrones (categorías)
  ipcMain.handle('db:get-patterns', async () => {
    return await prisma.pattern.findMany({ orderBy: { name: 'asc' }})
  })
}