export function buildElectronPreload(): string {
  return `'use strict'
const { contextBridge, ipcRenderer } = require('electron')

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,
  version: process.versions.electron,

  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),
  getName: () => ipcRenderer.invoke('get-name'),

  // Notifications
  notify: (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  },
})
`
}
