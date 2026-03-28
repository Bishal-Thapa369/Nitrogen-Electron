/**
 * file_content.js
 * Modular IPC handlers for reading and writing file content.
 * Separated from file_operations.js to keep data-stream logic 
 * isolated from file-system mutation logic (rename/delete).
 */

import { app, ipcMain, dialog } from 'electron';
import fs from 'fs/promises';
import path from 'path';

export function registerFileContentOperations() {
  
  // ── Save File (Overwrite) ──────────────────────────────────
  ipcMain.handle('fs-save-file', async (_event, filePath, content) => {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return { success: true };
    } catch (err) {
      console.error(`Save error for ${filePath}:`, err);
      return { success: false, error: err.message };
    }
  });

  // ── Save As (With Dialog) ─────────────────────────────────
  ipcMain.handle('fs-save-as-file', async (event, content, defaultPath = '') => {
    try {
      const win = event.sender.getOwnerBrowserWindow();
      const result = await dialog.showSaveDialog(win, {
        title: 'Save As',
        defaultPath: defaultPath || app.getPath('documents'),
        buttonLabel: 'Save',
        filters: [
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
      }

      await fs.writeFile(result.filePath, content, 'utf8');
      return { success: true, filePath: result.filePath };
    } catch (err) {
      console.error('Save As error:', err);
      return { success: false, error: err.message };
    }
  });
}
