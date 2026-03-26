/**
 * file_operations.js
 * Modular IPC handlers for file system mutations: rename and delete.
 * Separated from main.js per FIle-Rules.md §1.2 (Single Purpose) to ensure
 * changes to one operation never risk breaking another.
 */

import { ipcMain, shell, clipboard } from 'electron';
import fs from 'fs/promises';
import path from 'path';

/**
 * Registered all file-operation IPC handlers on the given ipcMain instance.
 * Called once from main.js during startup.
 */
export function registerFileOperations(fileExplorer) {

  // ── Rename ───────────────────────────────────────────────
  ipcMain.handle('fs-rename', async (_event, oldPath, newName) => {
    try {
      const parentDir = path.dirname(oldPath);
      const newPath = path.join(parentDir, newName);

      // Guard: target already exists
      try {
        await fs.access(newPath);
        return { success: false, error: `"${newName}" already exists in this directory.` };
      } catch {
        // Good — target does not exist
      }

      await fs.rename(oldPath, newPath);
      return { success: true, newPath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Delete (Native C++ Background Deletion) ───────────────
  ipcMain.handle('fs-delete', async (_event, targetPath) => {
    try {
      if (fileExplorer && fileExplorer.deleteItemAsync) {
        fileExplorer.deleteItemAsync(targetPath);
        return { success: true };
      }
      
      // Fallback to Shell trash if C++ bridge is not available
      await shell.trashItem(targetPath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Delete Bulk (Native C++ Vector Deletion) ─────────────
  ipcMain.handle('fs-delete-bulk', async (_event, targetPaths) => {
    try {
      if (fileExplorer && fileExplorer.deleteItemsBulk) {
        fileExplorer.deleteItemsBulk(targetPaths);
        return { success: true };
      }
      
      // Bulk fallback: loop with trashItem (this is what caused the OOM before,
      // but only as a last resort if C++ is not loaded for some reason)
      for (const p of targetPaths) {
        await shell.trashItem(p);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Create File ───────────────────────────────────────────
  ipcMain.handle('fs-create-file', async (_event, parentDir, fileName) => {
    try {
      const newPath = path.join(parentDir, fileName);
      try {
        await fs.access(newPath);
        return { success: false, error: `"${fileName}" already exists.` };
      } catch { /* Good — does not exist */ }
      await fs.writeFile(newPath, '', 'utf8');
      return { success: true, newPath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Create Folder ─────────────────────────────────────────
  ipcMain.handle('fs-create-folder', async (_event, parentDir, folderName) => {
    try {
      const newPath = path.join(parentDir, folderName);
      try {
        await fs.access(newPath);
        return { success: false, error: `"${folderName}" already exists.` };
      } catch { /* Good — does not exist */ }
      await fs.mkdir(newPath, { recursive: true });
      return { success: true, newPath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Reveal in Explorer/Finder ─────────────────────────────
  ipcMain.handle('fs-reveal', async (_event, targetPath) => {
    try {
      shell.showItemInFolder(targetPath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Copy Full Path ────────────────────────────────────────
  ipcMain.handle('fs-copy-path', async (_event, targetPath) => {
    try {
      clipboard.writeText(targetPath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Copy (Duplicate/Paste) ────────────────────────────────
  ipcMain.handle('fs-copy', async (_event, sourcePath, destDir) => {
    try {
      const fileName = path.basename(sourcePath);
      let destPath = path.join(destDir, fileName);
      let newName = fileName;

      // Handle name collision (intelligent duplication)
      let counter = 1;
      while (true) {
        try {
          await fs.access(destPath);
          // Exists, modify name
          const ext = path.extname(fileName);
          const base = path.basename(fileName, ext);
          const suffix = counter === 1 ? '-copy' : `-copy${counter}`;
          newName = `${base}${suffix}${ext}`;
          destPath = path.join(destDir, newName);
          counter++;
        } catch {
          break; // Does not exist, safe to use
        }
      }

      await fs.cp(sourcePath, destPath, { recursive: true });
      return { success: true, newPath: destPath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── Move (Cut/Paste) ──────────────────────────────────────
  ipcMain.handle('fs-move', async (_event, sourcePath, destDir) => {
    try {
      const fileName = path.basename(sourcePath);
      const destPath = path.join(destDir, fileName);

      // Guard: target already exists
      try {
        await fs.access(destPath);
        if (sourcePath !== destPath) {
          return { success: false, error: `"${fileName}" already exists in the destination.` };
        }
      } catch { /* Good */ }

      // Try fast rename first
      try {
        await fs.rename(sourcePath, destPath);
      } catch (renameErr) {
        if (renameErr.code === 'EXDEV') {
          // Cross-device move fallback
          await fs.cp(sourcePath, destPath, { recursive: true });
          await shell.trashItem(sourcePath);
        } else {
          throw renameErr;
        }
      }
      return { success: true, newPath: destPath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}
