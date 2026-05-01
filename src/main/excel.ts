import { ipcMain, dialog, BrowserWindow } from 'electron'
import * as ExcelJS from 'exceljs'

export const setupExcelHandlers = () => {
  ipcMain.handle('export:excel', async (_, routineData) => {
    try {
      // 1. Abrir ventana de "Guardar Como..."
      const window = BrowserWindow.getFocusedWindow()
      const { canceled, filePath } = await dialog.showSaveDialog(window!, {
        title: 'Exportar Rutina a Excel',
        defaultPath: `Rutina_${routineData.clientName || 'Cliente'}.xlsx`,
        filters: [{ name: 'Archivos Excel', extensions: ['xlsx'] }]
      })

      if (canceled || !filePath) return { success: false, canceled: true }

      // 2. Crear el archivo Excel
      const workbook = new ExcelJS.Workbook()
      
      // Iteramos sobre cada día para crear una pestaña por día
      routineData.days.forEach((day: any) => {
        const sheet = workbook.addWorksheet(`DÍA ${day.dayNumber}`)
        
        // Configurar las columnas basadas en tu imagen de referencia
        sheet.columns = [
          { header: 'Patrón + Video', key: 'pattern', width: 25 },
          { header: 'Exercise', key: 'exercise', width: 35 },
          { header: 'Sets', key: 'sets', width: 10 },
          { header: 'Reps', key: 'reps', width: 15 },
          { header: 'Rest (Seconds)', key: 'rest', width: 15 },
          { header: 'Weight', key: 'weight', width: 12 },
          { header: 'RPE', key: 'rpe', width: 10 },
        ]

        // Pintar el encabezado de gris oscuro
        const headerRow = sheet.getRow(1)
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F4F4F' } // Gris oscuro
        }

        // Agregar los ejercicios de este día
        day.exercises.forEach((ex: any) => {
          const row = sheet.addRow({
            pattern: ex.patternName || '',
            exercise: ex.exerciseName || '',
            sets: ex.sets || '',
            reps: ex.reps || '',
            rest: ex.rest || '',
            weight: ex.weight || '',
            rpe: ex.rpe || ''
          })

          // Si el ejercicio tiene video, hacer que el nombre sea clickeable
          if (ex.videoUrl) {
            row.getCell('exercise').value = {
              text: ex.exerciseName,
              hyperlink: ex.videoUrl,
              tooltip: 'Ver video explicativo'
            }
            row.getCell('exercise').font = {
              color: { argb: 'FF0000FF' }, // Azul
              underline: true
            }
          }
        })
      })

      // 3. Guardar físicamente el archivo en la ruta elegida
      await workbook.xlsx.writeFile(filePath)
      
      return { success: true, filePath }
    } catch (error) {
      console.error('Error generando Excel:', error)
      return { success: false, error: String(error) }
    }
  })
}