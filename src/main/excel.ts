import { ipcMain, dialog, BrowserWindow } from 'electron'
import * as ExcelJS from 'exceljs'

export const setupExcelHandlers = () => {
  ipcMain.handle('export:excel', async (_, routineData) => {
    try {
      const window = BrowserWindow.getFocusedWindow()
      const { canceled, filePath } = await dialog.showSaveDialog(window!, {
        title: 'Exportar Rutina Profesional',
        defaultPath: `Plan_Entrenamiento_${routineData.clientName || 'Cliente'}.xlsx`,
        filters: [{ name: 'Archivos Excel', extensions: ['xlsx'] }]
      })

      if (canceled || !filePath) return { success: false, canceled: true }

      const workbook = new ExcelJS.Workbook()
      const sheet = workbook.addWorksheet('SEMANA 1')

      // 1. Configuración de Columnas
      sheet.columns = [
        { key: 'pattern', width: 20 },   // A
        { key: 'exercise', width: 40 },  // B
        { key: 'sets', width: 8 },       // C
        { key: 'reps', width: 12 },      // D
        { key: 'rest', width: 12 },      // E
        { key: 'weight', width: 10 },    // F
        { key: 'rpe', width: 8 },        // G
        { width: 5 },                    // H
        { width: 5 },                    // I
        { width: 5 },                    // J
        { key: 'w_type', width: 15 },    // K
        { key: 'w_ex', width: 35 },      // L
        { key: 'w_sets', width: 8 },     // M
        { key: 'w_reps', width: 12 },    // N
        { key: 'w_weight', width: 10 }   // O
      ]

      let currentStartRow = 1

      routineData.days.forEach((day: any) => {
        // --- ENCABEZADO DEL DÍA ---
        sheet.mergeCells(`A${currentStartRow}:G${currentStartRow + 1}`)
        const dayHeader = sheet.getCell(`A${currentStartRow}`)
        dayHeader.value = `DÍA ${day.dayNumber} - ${routineData.clientName.toUpperCase()}`
        dayHeader.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
        dayHeader.alignment = { vertical: 'middle', horizontal: 'center' }
        dayHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }

        // --- CABECERA RUTINA PRINCIPAL ---
        const tableHeaderRow = currentStartRow + 2
        const mainHeader = sheet.getRow(tableHeaderRow)
        mainHeader.values = ['PATRÓN', 'EJERCICIO', 'SETS', 'REPS', 'REST', 'PESO', 'RPE']
        
        for (let i = 1; i <= 7; i++) {
          const cell = mainHeader.getCell(i)
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        }

        // --- CABECERA CALENTAMIENTO ---
        sheet.mergeCells(`K${tableHeaderRow - 1}:O${tableHeaderRow - 1}`)
        const warmTitle = sheet.getCell(`K${tableHeaderRow - 1}`)
        warmTitle.value = 'CALENTAMIENTO / MOVILIDAD'
        warmTitle.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        warmTitle.alignment = { horizontal: 'center' }
        warmTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } }

        const warmHeader = sheet.getRow(tableHeaderRow)
        warmHeader.getCell(11).value = 'TIPO'
        warmHeader.getCell(12).value = 'EJERCICIO'
        warmHeader.getCell(13).value = 'SETS'
        warmHeader.getCell(14).value = 'REPS'
        warmHeader.getCell(15).value = 'PESO'

        for (let i = 11; i <= 15; i++) {
          const cell = warmHeader.getCell(i)
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        }

        // --- RENDERIZADO DE DATOS ---
        const maxRows = Math.max(day.exercises.length, (day.warmups || []).length)
        
        for (let i = 0; i < maxRows; i++) {
          const rowIdx = tableHeaderRow + 1 + i
          const row = sheet.getRow(rowIdx)

          if (day.exercises[i]) {
            const ex = day.exercises[i]
            row.getCell(1).value = ex.patternName
            if (ex.videoUrl) {
              row.getCell(2).value = { text: `▶ ${ex.exerciseName}`, hyperlink: ex.videoUrl }
              row.getCell(2).font = { color: { argb: 'FF2563EB' }, underline: true }
            } else {
              row.getCell(2).value = ex.exerciseName
            }
            row.getCell(3).value = ex.sets
            row.getCell(4).value = ex.reps
            row.getCell(5).value = ex.rest
            row.getCell(6).value = ex.weight
            row.getCell(7).value = ex.rpe
          }

          if (day.warmups && day.warmups[i]) {
            const w = day.warmups[i]
            row.getCell(11).value = w.exerciseName.toLowerCase().includes('movilidad') ? 'MOVILIDAD' : 'CALENTAMIENTO'
            if (w.videoUrl) {
              row.getCell(12).value = { text: w.exerciseName, hyperlink: w.videoUrl }
              row.getCell(12).font = { color: { argb: 'FF0284C7' }, italic: true }
            } else {
              row.getCell(12).value = w.exerciseName
            }
            row.getCell(13).value = w.sets
            row.getCell(14).value = w.reps
            row.getCell(15).value = w.weight
          }
          
          row.eachCell({ includeEmpty: false }, (cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
              right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
            }
          })
        }

        // --- TABLA DE VOLUMEN ---
        const volumeStartRow = tableHeaderRow + maxRows + 2
        const volHeaderCell = sheet.getCell(`A${volumeStartRow}`)
        volHeaderCell.value = 'RESUMEN DE VOLUMEN POR PATRÓN'
        volHeaderCell.font = { bold: true, size: 10 }
        
        const volumeMap: any = {}
        day.exercises.forEach((ex: any) => {
          if (ex.patternName) {
            volumeMap[ex.patternName] = (volumeMap[ex.patternName] || 0) + parseInt(ex.sets || 0)
          }
        })

        let volRowOffset = 1
        Object.entries(volumeMap).forEach(([pattern, totalSets]) => {
          const vRowIdx = volumeStartRow + volRowOffset
          const vRow = sheet.getRow(vRowIdx)
          vRow.getCell(1).value = pattern
          vRow.getCell(2).value = `${totalSets} Series Totales`
          
          vRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }
          // CORRECCIÓN FINAL AQUÍ: Se reemplazó outline por los 4 lados
          vRow.getCell(1).border = { 
            top: { style: 'thin', color: { argb: 'FF94A3B8' } },
            left: { style: 'thin', color: { argb: 'FF94A3B8' } },
            bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
            right: { style: 'thin', color: { argb: 'FF94A3B8' } }
          }
          volRowOffset++
        })

        currentStartRow = volumeStartRow + volRowOffset + 2
      })

      await workbook.xlsx.writeFile(filePath)
      return { success: true, filePath }
    } catch (error) {
      console.error('Error generando Excel:', error)
      return { success: false, error: String(error) }
    }
  })
}