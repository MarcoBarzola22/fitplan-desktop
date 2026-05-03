import { PrismaClient } from '@prisma/client'
import { ipcMain, app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

// 1. Configuración de la ruta de la base de datos (Persistencia en AppData)
const dbPath = path.join(app.getPath('userData'), 'local.db')

// Lógica para producción: si no existe la DB en AppData, la copiamos del molde original
if (app.isPackaged && !fs.existsSync(dbPath)) {
  const dbTemplate = path.join(process.resourcesPath, 'local.db')
  if (fs.existsSync(dbTemplate)) {
    fs.copyFileSync(dbTemplate, dbPath)
  }
}

// 2. Inicialización de Prisma con la ruta dinámica
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: app.isPackaged ? `file:${dbPath}` : process.env.DATABASE_URL
    }
  }
})

/**
 * Registra todos los manejadores IPC para la comunicación entre 
 * el Frontend (React) y el Backend (SQLite/Prisma).
 */
export const setupDBHandlers = () => {
  
  // --- BIBLIOTECA DE EJERCICIOS ---
  ipcMain.handle('db:get-exercises', async () => {
    try {
      return await prisma.exercise.findMany({
        include: { pattern: true },
        orderBy: { name: 'asc' }
      })
    } catch (e) {
      console.error("Error al obtener ejercicios:", e)
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

  // --- PERSISTENCIA DE RUTINAS (V2 con soporte para Clientes) ---
  ipcMain.handle('db:save-routine', async (_, routineData) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const routine = await tx.routine.create({
          data: {
            clientName: routineData.clientName,
            daysCount: routineData.daysPerWeek,
            clientId: routineData.clientId || null, // Link opcional con el ID de cliente de la V2[cite: 1]
            days: {
              create: routineData.days.map((day: any) => ({
                dayNumber: day.dayNumber,
                exercises: {
                  create: day.exercises
                    .filter((ex: any) => ex.exerciseId)
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

  // --- MÓDULO DE CLIENTES V2[cite: 1] ---
  
  // Guardar un cliente nuevo
  ipcMain.handle('create-client', async (_, data) => {
    return await createClient(data)
  })

  // Obtener la lista de alumnos
  ipcMain.handle('get-clients', async () => {
    try {
      const clients = await prisma.client.findMany({
        orderBy: { name: 'asc' }
      })
      return { success: true, data: clients }
    } catch (e) {
      console.error("Error al obtener clientes:", e)
      return { success: false, error: String(e) }
    }
  })

  // Eliminar un cliente
ipcMain.handle('delete-client', async (_, clientId: string) => {
  try {
    await prisma.client.delete({
      where: { id: clientId }
    });
    return { success: true };
  } catch (e) {
    console.error("Error al eliminar cliente:", e);
    return { success: false, error: "No se puede eliminar: el cliente tiene rutinas o pagos asociados." };
  }
});

// Actualizar datos de un cliente
ipcMain.handle('update-client', async (_, { id, ...data }) => {
  try {
    const updated = await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        age: data.age && data.age !== "" ? parseInt(String(data.age)) : null,
weight: data.weight && data.weight !== "" ? parseFloat(String(data.weight)) : null,
height: data.height && data.height !== "" ? parseFloat(String(data.height)) : null,
      }
    });
    return { success: true, data: updated };
  } catch (e) {
    console.error("Error al actualizar cliente:", e);
    return { success: false, error: "Error al actualizar los datos." };
  }
});
}

/**
 * Función lógica para la creación de clientes con tipos de datos correctos[cite: 1].
 */
export async function createClient(clientData: { 
  name: string, 
  phone?: string, 
  email?: string, 
  age?: string | number, 
  weight?: string | number, 
  height?: string | number 
}) {
  try {
    const newClient = await prisma.client.create({
      data: {
        name: clientData.name,
        phone: clientData.phone || null,
        email: clientData.email || null,
        age: clientData.age ? parseInt(String(clientData.age)) : null,
        weight: clientData.weight ? parseFloat(String(clientData.weight)) : null,
        height: clientData.height ? parseFloat(String(clientData.height)) : null,
      },
    })
    return { success: true, data: newClient }
  } catch (error) {
    console.error("Error en Prisma createClient:", error)
    return { success: false, error: "No se pudo guardar el cliente en la base de datos" }
  }
}