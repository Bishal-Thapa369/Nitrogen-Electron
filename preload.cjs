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

  // File Operations (Modular — src/main/ipc/file_operations.js)
  renameItem: (oldPath, newName) => ipcRenderer.invoke('fs-rename', oldPath, newName),
  deleteItem: (targetPath) => ipcRenderer.invoke('fs-delete', targetPath),
  createFile: (parentDir, fileName) => ipcRenderer.invoke('fs-create-file', parentDir, fileName),
  createFolder: (parentDir, folderName) => ipcRenderer.invoke('fs-create-folder', parentDir, folderName),
  revealItem: (targetPath) => ipcRenderer.invoke('fs-reveal', targetPath),
  copyPath: (targetPath) => ipcRenderer.invoke('fs-copy-path', targetPath),
  copyItem: (sourcePath, destDir) => ipcRenderer.invoke('fs-copy', sourcePath, destDir),
  moveItem: (sourcePath, destDir) => ipcRenderer.invoke('fs-move', sourcePath, destDir),
});
