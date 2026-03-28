import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { registerFileOperations } from './src/main/ipc/file_operations.js';
import { registerFileContentOperations } from './src/main/ipc/file_content.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the C++ native addon
const require = createRequire(import.meta.url);
const fileExplorer = require('./build/Release/nitrogen_file_explorer.node');
const terminalNative = require('./build/Release/nitrogen_terminal.node');
const searchNative = require('./build/Release/nitrogen_search.node');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#000000',
    frame: false, // Frameless window for custom TopBar
    titleBarStyle: 'hidden',
    resizable: true,
    minWidth: 800,
    minHeight: 600,
    hasShadow: true,
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

  ipcMain.handle('terminal:spawn', (_event, rows, cols) => {
    const shell = process.env.SHELL || '/bin/bash';
    // terminalNative.spawn returns a unique ID for the session
    const id = terminalNative.spawn(rows, cols, shell, (data) => {
      win.webContents.send('terminal:data', { id, data });
    });
    return id;
  });

  ipcMain.on('terminal:write', (_event, id, data) => {
    terminalNative.write(id, data);
  });

  ipcMain.on('terminal:resize', (_event, id, rows, cols) => {
    terminalNative.resize(id, rows, cols);
  });

  ipcMain.on('terminal:kill', (_event, id) => {
    if (terminalNative.kill) {
      terminalNative.kill(id);
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
  ipcMain.handle('refresh-directory', async (_event, dirPath, force = false) => {
    const node = fileExplorer.refreshDirectory(dirPath, force);
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

  // ---- Universal Search IPC ----
  ipcMain.handle('search-all', async (_event, query, rootPath) => {
    return new Promise((resolve, reject) => {
      searchNative.searchAsync(query, rootPath, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  });

  // ---- Global File Indexing (Ctrl+P God-Mode) ----
  ipcMain.handle('get-all-files', async (_event, rootPath) => {
    const fs = await import('fs/promises');
    const files = [];

    const walk = async (dir) => {
      try {
          const list = await fs.readdir(dir, { withFileTypes: true });
          for (const item of list) {
              const res = path.resolve(dir, item.name);
              // Standard ignore patterns for high performance indexing
              if (item.name === 'node_modules' || item.name === '.git' || item.name === 'dist' || item.name === 'build' || item.name === '.vite') {
                  continue;
              }
              if (item.isDirectory()) {
                  await walk(res);
              } else {
                  files.push({ 
                      path: res.replace(/\\/g, '/'), 
                      name: item.name 
                  });
              }
          }
      } catch (err) {
          console.error(`Index walk error for ${dir}:`, err);
      }
    };

    if (rootPath) {
        await walk(rootPath);
    }
    return files;
  });
}

app.whenReady().then(() => {
  registerFileOperations(fileExplorer);
  registerFileContentOperations();
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
