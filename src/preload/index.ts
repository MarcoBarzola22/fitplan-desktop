import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Definimos las funciones que el Frontend podrá usar
const api = {
  getExercises: () => ipcRenderer.invoke('db:get-exercises'),
  createExercise: (data: any) => ipcRenderer.invoke('db:create-exercise', data),
  getPatterns: () => ipcRenderer.invoke('db:get-patterns'),
  saveRoutine: (routineData: any) => ipcRenderer.invoke('db:save-routine', routineData),
  exportExcel: (data: any) => ipcRenderer.invoke('export:excel', data),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api) // <--- ¡Importante! Exponemos 'api'
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}