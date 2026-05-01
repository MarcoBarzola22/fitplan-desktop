import { ipcMain, dialog, BrowserWindow } from 'electron'
import * as ExcelJS from 'exceljs'

export const setupExcelHandlers = () => {
  ipcMain.handle('export:excel', async (_, routineData) => {
    try {
      const window = BrowserWindow.getFocusedWindow()
      const { canceled, filePath } = await dialog.showSaveDialog(window!, {
        title: 'Exportar Rutina a Excel',
        defaultPath: `Rutina_${routineData.clientName || 'Cliente'}.xlsx`,
        filters: [{ name: 'Archivos Excel', extensions: ['xlsx'] }]
      })

      if (canceled || !filePath) return { success: false, canceled: true }

      const workbook = new ExcelJS.Workbook()
      
      routineData.days.forEach((day: any) => {
        const sheet = workbook.addWorksheet(`DÍA ${day.dayNumber}`)
        
        // 1. Configurar anchos de columna perfectos
        sheet.columns = [
          { key: 'pattern', width: 22 },
          { key: 'exercise', width: 45 },
          { key: 'sets', width: 10 },
          { key: 'reps', width: 12 },
          { key: 'rest', width: 15 },
          { key: 'weight', width: 12 },
          { key: 'rpe', width: 10 },
        ]

        // --- 2. ENCABEZADO PRINCIPAL (BRANDING) ---
        // Combinamos celdas A1 hasta G2 para el título
        sheet.mergeCells('A1:G2')
        const titleCell = sheet.getCell('A1')
        titleCell.value = 'RUTINA DE ENTRENAMIENTO - NADIRCOACH'
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } } // Gris muy oscuro/azulado

        // --- 3. DATOS DEL CLIENTE ---
        sheet.mergeCells('A3:G3')
        const clientCell = sheet.getCell('A3')
        clientCell.value = `  CLIENTE: ${routineData.clientName ? routineData.clientName.toUpperCase() : 'SIN NOMBRE'}   |   DÍA ${day.dayNumber} `
        clientCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1E293B' } }
        clientCell.alignment = { vertical: 'middle', horizontal: 'left' }
        clientCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } } // Fondo gris clarito
        
        // Un poco de espacio antes de la tabla
        sheet.getRow(4).height = 10

        // --- 4. CABECERAS DE LA TABLA ---
        const headerRow = sheet.getRow(5)
        headerRow.values = ['PATRÓN / ENFOQUE', 'EJERCICIO', 'SETS', 'REPS', 'DESCANSO', 'PESO (Kg)', 'RPE']
        headerRow.height = 25 // Fila más alta para que respire
        
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } } // Azul vibrante profesional
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
          // Bordes oscuros para la cabecera
          cell.border = {
            top: { style: 'medium', color: { argb: 'FF1E293B' } },
            left: { style: 'thin', color: { argb: 'FF1E293B' } },
            bottom: { style: 'medium', color: { argb: 'FF1E293B' } },
            right: { style: 'thin', color: { argb: 'FF1E293B' } }
          }
        })

        // --- 5. RELLENAR DATOS DE EJERCICIOS ---
        let currentRow = 6
        day.exercises.forEach((ex: any) => {
          const row = sheet.getRow(currentRow)
          row.height = 22 // Filas más altas
          
          row.getCell(1).value = ex.patternName || ''
          row.getCell(2).value = ex.exerciseName || ''
          row.getCell(3).value = ex.sets || ''
          row.getCell(4).value = ex.reps || ''
          row.getCell(5).value = ex.rest ? `${ex.rest} seg` : ''
          row.getCell(6).value = ex.weight || ''
          row.getCell(7).value = ex.rpe || ''

          // Formato para hipervínculo si hay video
          if (ex.videoUrl) {
            const exCell = row.getCell(2)
            exCell.value = { text: `▶ ${ex.exerciseName}`, hyperlink: ex.videoUrl, tooltip: 'Ver video explicativo' }
            exCell.font = { color: { argb: 'FF2563EB' }, underline: true, bold: true }
          } else {
            row.getCell(2).font = { bold: true, color: { argb: 'FF333333' } }
          }

          // Estilos, alineación y bordes celda por celda
          row.eachCell((cell, colNumber) => {
            // Centrar números, alinear a la izquierda textos (Patrón y Ejercicio)
            if (colNumber > 2) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' }
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 } // Indent da un margencito interior
            }

            // Bordes suaves para las celdas interiores
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
            }
          })
          
          currentRow++
        })
      })

      await workbook.xlsx.writeFile(filePath)
      
      return { success: true, filePath }
    } catch (error) {
      console.error('Error generando Excel:', error)
      return { success: false, error: String(error) }
    }
  })
}