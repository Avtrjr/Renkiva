const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  onMenuNewStream: (callback) => ipcRenderer.on('menu-new-stream', callback),
  
  // Platform info
  platform: process.platform,
  
  // App info
  getVersion: () => ipcRenderer.invoke('app-version'),
  
  // File operations (for future use)
  selectFile: () => ipcRenderer.invoke('dialog-select-file'),
  
  // Mesh network helpers (for future native integration)
  startMeshDiscovery: () => ipcRenderer.invoke('mesh-start-discovery'),
  stopMeshDiscovery: () => ipcRenderer.invoke('mesh-stop-discovery'),
});