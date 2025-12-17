import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  readTodos: () => ipcRenderer.invoke('read-todos'),
  saveTodos: (data) => ipcRenderer.invoke('save-todos', data),

  mediaControl: (action) => ipcRenderer.invoke('media-control', action),
  appControl: (action, appName) => ipcRenderer.invoke('app-control', { action, appName })
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
