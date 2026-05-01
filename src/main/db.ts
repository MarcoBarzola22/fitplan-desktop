import { PrismaClient } from '@prisma/client'
import { ipcMain } from 'electron'

const prisma = new PrismaClient()

export const setupDBHandlers = () => {
  // --- BIBLIOTECA DE EJERCICIOS ---

  ipcMain.handle('db:get-exercises', async () => {
    try {
      return await prisma.exercise.findMany({
        include: { pattern: true },
        orderBy: { name: 'asc' }
      })
    } catch (e) {
      console.error(e)
      return []
    }
  })

  ipcMain.handle('db:create-exercise', async (_, data) => {
    try {
      let pattern = await prisma.pattern.findUnique({
        where: { name: data.patternName }
      })

      if (!pattern) {
        pattern = await prisma.pattern.create({
          data: { name: data.patternName }
        })
      }

      const exercise = await prisma.exercise.create({
        data: {
          name: data.name,
          videoUrl: data.videoUrl,
          patternId: pattern.id,
          isWarmup: data.isWarmup || false
        }
      })
      
      return { success: true, exercise }
    } catch (e) {
      console.error(e)
      return { success: false, error: String(e) }
    }
  })

  // --- PERSISTENCIA DE RUTINAS (LO NUEVO) ---

  // 1. Guardar o Actualizar una Rutina Completa
  ipcMain.handle('db:save-routine', async (_, routineData) => {
    try {
      // Usamos una transacción para asegurar integridad total
      const result = await prisma.$transaction(async (tx) => {
        // Creamos la cabecera de la rutina
        const routine = await tx.routine.create({
          data: {
            clientName: routineData.clientName,
            daysCount: routineData.daysPerWeek,
            days: {
              create: routineData.days.map((day: any) => ({
                dayNumber: day.dayNumber,
                // Guardamos los Ejercicios Principales
                exercises: {
                  create: day.exercises
                    .filter((ex: any) => ex.exerciseId) // Solo si seleccionó un ejercicio
                    .map((ex: any, index: number) => ({
                      exerciseId: parseInt(ex.exerciseId),
                      sets: ex.sets,
                      reps: ex.reps,
                      rest: ex.rest,
                      weight: ex.weight,
                      rpe: ex.rpe,
                      order: index
                    }))
                },
                // Guardamos los Calentamientos
                warmups: {
                  create: day.warmups
                    .filter((w: any) => w.exerciseId)
                    .map((w: any, index: number) => ({
                      exerciseId: parseInt(w.exerciseId),
                      sets: w.sets,
                      reps: w.reps,
                      weight: w.weight,
                      order: index
                    }))
                }
              }))
            }
          }
        })
        return routine
      })

      return { success: true, routineId: result.id }
    } catch (e) {
      console.error("Error al guardar rutina:", e)
      return { success: false, error: String(e) }
    }
  })

  // 2. Obtener historial de rutinas (para la lista de "Mis Rutinas")
  ipcMain.handle('db:get-all-routines', async () => {
    try {
      return await prisma.routine.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, clientName: true, createdAt: true, daysCount: true }
      })
    } catch (e) {
      console.error(e)
      return []
    }
  })

  ipcMain.handle('db:get-patterns', async () => {
    return await prisma.pattern.findMany({ orderBy: { name: 'asc' }})
  })
}