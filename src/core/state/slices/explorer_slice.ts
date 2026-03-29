import { StateCreator } from 'zustand';
import { EditorState, FileTreeNode } from '../types';
import { updateTreeNode, getParentPath } from '../utils/tree_helpers';

export const createExplorerSlice: StateCreator<EditorState, [], [], Partial<EditorState>> = (set, get) => ({
  fileTree: null,
  rootPath: null,
  expandedFolders: [],
  extensionMap: {},
  selectedPath: null,
  selectedPaths: [],
  navigationFocusPath: null,
  clipboardItems: null,

  setFileTree: (tree, rootPath) => {
    set({ fileTree: tree, rootPath, expandedFolders: tree ? [tree.path] : [] });
    get().updateExtensionMap();
  },

  updateExtensionMap: async () => {
    try {
      const exts = await window.electronAPI.getExtensions();
      set({ extensionMap: exts as unknown as Record<number, string> });
    } catch (err) {
      console.error('Failed to sync extension map', err);
    }
  },

  updateNode: async (path, updatedNode) => {
    const { fileTree } = get();
    if (!fileTree) return;
    set({ fileTree: updateTreeNode(fileTree, path, updatedNode) });
    await get().updateExtensionMap();
  },

  toggleFolder: (dirPath) => {
    set((state) => ({
      expandedFolders: state.expandedFolders.includes(dirPath)
        ? state.expandedFolders.filter((p) => p !== dirPath)
        : [...state.expandedFolders, dirPath],
    }));
  },

  setSelectedPath: (path, multi = false) => set((state) => ({ 
    selectedPath: path, 
    navigationFocusPath: path, // Sync nav focus with click
    selectedPaths: multi ? state.selectedPaths : (path ? [path] : []) 
  })),

  setNavigationFocusPath: (path) => set({ navigationFocusPath: path }),

  setSelectedPaths: (paths) => set({ selectedPaths: paths }),

  selectAll: (forcedPath) => {
    const state = get();
    const { fileTree, selectedPath, rootPath } = state;
    if (!fileTree || !rootPath) return;

    let targetDir = forcedPath || rootPath;
    
    if (!forcedPath && selectedPath) {
      const findNode = (path: string, node: FileTreeNode | null = fileTree): FileTreeNode | null => {
        if (!node) return null;
        if (node.path === path) return node;
        for (const child of node.children) {
          if (child.path === path) return child;
          if (child.isDirectory && path.startsWith(child.path + '/')) {
            const found = findNode(path, child);
            if (found) return found;
          }
        }
        return null;
      };

      const selNode = findNode(selectedPath);
      if (selNode) {
        targetDir = selNode.isDirectory ? selNode.path : getParentPath(selNode.path);
      }
    }

    const findNodeByPath = (path: string, node: FileTreeNode | null = fileTree): FileTreeNode | null => {
        if (!node) return null;
        if (node.path === path) return node;
        for (const child of node.children) {
          if (child.path === path) return child;
          if (child.isDirectory && path.startsWith(child.path + '/')) {
            const found = findNodeByPath(path, child);
            if (found) return found;
          }
        }
        return null;
    };

    const targetNode = findNodeByPath(targetDir);
    if (targetNode && targetNode.isDirectory) {
      const allChildPaths = targetNode.children.map(c => c.path);
      set({ selectedPaths: allChildPaths });
    }
  },

  setClipboardItems: (paths, type) => set({ clipboardItems: { paths, type } }),

  collapseAll: () => {
    const root = get().fileTree;
    set({ expandedFolders: root ? [root.path] : [] });
  },

  renameNode: async (oldPath, newName) => {
    const result = await window.electronAPI.renameItem(oldPath, newName);
    if (result.success) {
      const parentDir = getParentPath(oldPath);
      const newPath = parentDir + (parentDir.endsWith('/') ? '' : '/') + newName;
      await window.electronAPI.unmarkForDeletionBulk([newPath]);
      const refreshed = await window.electronAPI.refreshDirectory(parentDir, true);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },

  createFile: async (parentDir, fileName) => {
    const result = await window.electronAPI.createFile(parentDir, fileName);
    if (result.success) {
      const newPath = parentDir + (parentDir.endsWith('/') ? '' : '/') + fileName;
      await window.electronAPI.unmarkForDeletionBulk([newPath]);
      const refreshed = await window.electronAPI.refreshDirectory(parentDir, true);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },

  createFolder: async (parentDir, folderName) => {
    const result = await window.electronAPI.createFolder(parentDir, folderName);
    if (result.success) {
      const newPath = parentDir + (parentDir.endsWith('/') ? '' : '/') + folderName;
      await window.electronAPI.unmarkForDeletionBulk([newPath]);
      const { expandedFolders } = get();
      if (!expandedFolders.includes(parentDir)) {
        set((state) => ({ expandedFolders: [...state.expandedFolders, parentDir] }));
      }
      const refreshed = await window.electronAPI.refreshDirectory(parentDir, true);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },

  refreshRoot: async () => {
    const { rootPath, expandedFolders } = get();
    if (!rootPath) return;
    try {
      const buildFreshTreeDeep = async (currentPath: string): Promise<FileTreeNode | null> => {
        const freshNode = await window.electronAPI.refreshDirectory(currentPath, true);
        if (!freshNode) return null;

        if (expandedFolders.includes(currentPath)) {
           const processedChildren = await Promise.all(
              freshNode.children.map(async (child: FileTreeNode) => {
                 if (child.isDirectory && expandedFolders.includes(child.path)) {
                    const deepChild = await buildFreshTreeDeep(child.path);
                    return deepChild || child;
                 }
                 return child;
              })
           );
           freshNode.children = processedChildren;
           freshNode.isLoaded = true;
        }
        return freshNode;
      };

      const newTree = await buildFreshTreeDeep(rootPath);
      if (newTree) {
         set({ fileTree: newTree });
         await get().updateExtensionMap();
      }
    } catch (err) {
      console.error('Refresh failed', err);
    }
  },

  deleteNode: async (targetPath) => {
    return get().deleteNodesBulk([targetPath]);
  },

  deleteNodesBulk: async (paths) => {
    if (!paths || paths.length === 0) return { success: true };
    const result = await window.electronAPI.deleteItemsBulk(paths);
    if (result.success) {
      await get().refreshRoot();
      const { activeGroupId, editorGroups } = get();
      const activeGroup = editorGroups.find(g => g.id === activeGroupId);
      const activeFilePath = activeGroup?.activeFilePath;
      const openTabs = activeGroup?.openTabs || [];
      paths.forEach(p => {
        if (activeFilePath === p || openTabs.find(t => t.path === p)) {
            get().closeFile(p, activeGroupId);
        }
      });
    }
    return result;
  },

  pasteNode: async () => {
    const { clipboardItems, selectedPath, rootPath, fileTree } = get();
    if (!clipboardItems || !fileTree || clipboardItems.paths.length === 0) return null;

    let destDir = rootPath || '/';
    if (selectedPath) {
      const findNode = (path: string, node: FileTreeNode | null = fileTree): FileTreeNode | null => {
        if (!node) return null;
        if (node.path === path) return node;
        for (const child of node.children) {
          if (child.path === path) return child;
          if (child.isDirectory && path.startsWith(child.path + '/')) {
            const found = findNode(path, child);
            if (found) return found;
          }
        }
        return null;
      };

      const selectedNode = findNode(selectedPath);
      if (selectedNode) {
        if (selectedNode.isDirectory) {
          destDir = selectedNode.path;
          if (!get().expandedFolders.includes(destDir)) {
             set((state) => ({ expandedFolders: [...state.expandedFolders, destDir] }));
          }
        } else {
          destDir = getParentPath(selectedNode.path);
        }
      }
    }

    const { paths: sourcePaths, type } = clipboardItems;
    const operations = sourcePaths.map(sourcePath => {
      if (type === 'copy') {
        return window.electronAPI.copyItem(sourcePath, destDir);
      } else {
        return window.electronAPI.moveItem(sourcePath, destDir);
      }
    });

    const results = await Promise.all(operations);
    const anySuccess = results.some(r => r.success);

    if (type === 'cut') set({ clipboardItems: null });

    if (anySuccess) {
      const destPaths = sourcePaths.map(sp => {
          const name = sp.split('/').pop() || '';
          return destDir + (destDir.endsWith('/') ? '' : '/') + name;
      });
      await window.electronAPI.unmarkForDeletionBulk(destPaths);
      await get().refreshRoot();
      await get().updateExtensionMap();
    }
    return results[0];
  },

  duplicateNode: async (targetPath) => {
    const parentDir = getParentPath(targetPath);
    const result = await window.electronAPI.copyItem(targetPath, parentDir);
    if (result.success) {
      const refreshed = await window.electronAPI.refreshDirectory(parentDir, true);
      if (refreshed) await get().updateNode(parentDir, refreshed);
    }
    return result;
  },
});
