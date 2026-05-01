/// <reference types="vite/client" />
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getExercises: () => Promise<any[]>
      createExercise: (data: any) => Promise<{ success: boolean; exercise?: any; error?: string }>
      getPatterns: () => Promise<any[]>
      // ESTA ES LA LÍNEA QUE TYPESCRIPT NO ENCUENTRA:
      exportExcel: (data: any) => Promise<{ success: boolean; canceled?: boolean; error?: string; filePath?: string }>
    }
  }
}