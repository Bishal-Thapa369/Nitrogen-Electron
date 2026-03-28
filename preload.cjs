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
  refreshDirectory: (dirPath, force = false) => ipcRenderer.invoke('refresh-directory', dirPath, force),
  getTree: () => ipcRenderer.invoke('get-tree'),
  getExtensions: () => ipcRenderer.invoke('get-extensions'),
  // File Operations (Content)
  saveFile: (filePath, content) => ipcRenderer.invoke('fs-save-file', filePath, content),
  saveFileAs: (content, defaultPath) => ipcRenderer.invoke('fs-save-as-file', content, defaultPath),
  searchAll: (query, rootPath) => ipcRenderer.invoke('search-all', query, rootPath),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  getAllFiles: (rootPath) => ipcRenderer.invoke('get-all-files', rootPath),

  // File Operations (Modular — src/main/ipc/file_operations.js)
  renameItem: (oldPath, newName) => ipcRenderer.invoke('fs-rename', oldPath, newName),
  deleteItem: (targetPath) => ipcRenderer.invoke('fs-delete', targetPath),
  deleteItemsBulk: (targetPaths) => ipcRenderer.invoke('fs-delete-bulk', targetPaths),
  unmarkForDeletionBulk: (targetPaths) => ipcRenderer.invoke('unmark-for-deletion-bulk', targetPaths),
  createFile: (parentDir, fileName) => ipcRenderer.invoke('fs-create-file', parentDir, fileName),
  createFolder: (parentDir, folderName) => ipcRenderer.invoke('fs-create-folder', parentDir, folderName),
  revealItem: (targetPath) => ipcRenderer.invoke('fs-reveal', targetPath),
  copyPath: (targetPath) => ipcRenderer.invoke('fs-copy-path', targetPath),
  copyItem: (sourcePath, destDir) => ipcRenderer.invoke('fs-copy', sourcePath, destDir),
  moveItem: (sourcePath, destDir) => ipcRenderer.invoke('fs-move', sourcePath, destDir),

  // Terminal (High-Performance C++ Backend)
  terminalSpawn: (rows, cols) => ipcRenderer.invoke('terminal:spawn', rows, cols),
  terminalWrite: (sid, data) => ipcRenderer.send('terminal:write', sid, data),
  terminalResize: (sid, rows, cols) => ipcRenderer.send('terminal:resize', sid, rows, cols),
  onTerminalData: (callback) => ipcRenderer.on('terminal:data', (_event, sid, data) => callback(sid, data)),

  // Piece Table (C++ Chunk-Based Editor Engine)
  pieceTableLoadFile: (filePath) => ipcRenderer.invoke('piece-table:load-file', filePath),
  pieceTableGetLines: (filePath, startLine, count) => ipcRenderer.invoke('piece-table:get-lines', filePath, startLine, count),
  pieceTableGetLineCount: (filePath) => ipcRenderer.invoke('piece-table:get-line-count', filePath),
  pieceTableCloseFile: (filePath) => ipcRenderer.invoke('piece-table:close-file', filePath),
});

