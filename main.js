import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { registerFileOperations } from './src/main/ipc/file_operations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the C++ native addon
const require = createRequire(import.meta.url);
const fileExplorer = require('./build/Release/nitrogen_file_explorer.node');
const terminalNative = require('./build/Release/nitrogen_terminal.node');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    frame: false, // Frameless window for custom TopBar
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Load the Vite dev server URL
  win.loadURL('http://localhost:1420');

  // Window Controls IPC
  ipcMain.on('window-minimize', () => win.minimize());
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  ipcMain.on('window-close', () => win.close());

  // ---- Terminal IPC ----
  let terminalSessionId = -1;

  ipcMain.handle('terminal:spawn', (_event, rows, cols) => {
    const shell = process.env.SHELL || '/bin/bash';
    terminalSessionId = terminalNative.spawn(rows, cols, shell, (data) => {
      win.webContents.send('terminal:data', data);
    });
    return terminalSessionId;
  });

  ipcMain.on('terminal:write', (_event, data) => {
    if (terminalSessionId !== -1) {
      terminalNative.write(terminalSessionId, data);
    }
  });

  ipcMain.on('terminal:resize', (_event, rows, cols) => {
    if (terminalSessionId !== -1) {
      terminalNative.resize(terminalSessionId, rows, cols);
    }
  });

  // ---- File Explorer IPC ----


  // Open Folder Dialog → returns the C++ tree or null
  ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'Open Folder',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const folderPath = result.filePaths[0];
    const tree = fileExplorer.openDirectory(folderPath, 1);
    return tree;
  });

  // Expand a directory (lazy-load)
  ipcMain.handle('expand-directory', async (_event, dirPath) => {
    const node = fileExplorer.expandDirectory(dirPath, 1);
    return node;
  });

  // Collapse a directory (free memory)
  ipcMain.handle('collapse-directory', async (_event, dirPath) => {
    fileExplorer.collapseDirectory(dirPath);
    return true;
  });

  // Refresh a directory
  ipcMain.handle('refresh-directory', async (_event, dirPath) => {
    const node = fileExplorer.refreshDirectory(dirPath);
    return node;
  });

  // Get the full current tree
  ipcMain.handle('get-tree', async () => {
    return fileExplorer.getTree();
  });

  // Get dynamic extension map from C++
  ipcMain.handle('get-extensions', async () => {
    return fileExplorer.getExtensions();
  });

  // Read a file's content
  ipcMain.handle('read-file', async (_event, filePath) => {
    const fs = await import('fs/promises');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch {
      return null;
    }
  });
}

app.whenReady().then(() => {
  registerFileOperations(fileExplorer);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
