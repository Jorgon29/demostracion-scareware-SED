const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  os: require('os'),
  fs: require('fs'),
  path: require('path'),
  childProcess: require('child_process')
});