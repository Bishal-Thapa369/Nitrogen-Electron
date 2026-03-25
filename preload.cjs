const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window Controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // File Explorer (C++ Backend)
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  expandDirectory: (dirPath) => ipcRenderer.invoke('expand-directory', dirPath),
  collapseDirectory: (dirPath) => ipcRenderer.invoke('collapse-directory', dirPath),
  refreshDirectory: (dirPath) => ipcRenderer.invoke('refresh-directory', dirPath),
  getTree: () => ipcRenderer.invoke('get-tree'),
  getExtensions: () => ipcRenderer.invoke('get-extensions'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
});
